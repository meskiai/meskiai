import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2023-10-16" as any,
});

import { prisma } from "../../../../lib/prisma";
import { sendSystemWelcomeEmail } from "../../../../lib/mail";
import { getPlanLimits } from "../../../../lib/pricing";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature found" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          const userId = session.metadata?.userId;
          const oldSubscriptionId = session.metadata?.oldSubscriptionId;

          if (userId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = (subscription as any).items.data[0].price.id;

            const periodEndTs = (subscription as any).current_period_end
              || (subscription as any).items?.data?.[0]?.current_period_end
              || (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);

            const dbUser = await prisma.user.update({
              where: { id: userId },
              data: {
                stripeSubscriptionId: subscriptionId,
                stripePriceId: priceId,
                stripeCurrentPeriodEnd: new Date(periodEndTs * 1000),
                subscriptionStatus: (subscription as any).status,
              },
            });

            // Reset monthly usage on new subscription
            // AUTO-ENABLE the AI agent — user just paid, they want it working immediately
            await prisma.userSettings.upsert({
              where: { userId },
              update: {
                aiCredits: getPlanLimits(priceId).credits === Infinity ? 99999999 : getPlanLimits(priceId).credits,
                autoReply: true,   // ← automatically ON after purchase
              },
              create: {
                userId,
                aiCredits: getPlanLimits(priceId).credits === Infinity ? 99999999 : getPlanLimits(priceId).credits,
                autoReply: true,   // ← automatically ON after purchase
                onboardingDone: false,
                replyTone: 'PROFESJONALNY',
              }
            });

            console.log(`[Stripe] Subskrypcja aktywowana dla userId=${userId}. autoReply=true automatycznie.`);

            // Send premium welcome email to the subscriber
            const toEmail = session.customer_details?.email || dbUser.email;
            if (toEmail) {
              await sendSystemWelcomeEmail(toEmail).catch((welcomeErr) => {
                console.error(`[Welcome Email] Failed to send welcome email to ${toEmail}:`, welcomeErr.message);
              });
            }

            // Cancel the OLD subscription immediately if this was an upgrade
            if (oldSubscriptionId && oldSubscriptionId !== subscriptionId) {
              try {
                await stripe.subscriptions.cancel(oldSubscriptionId);
                console.log(`Cancelled old subscription ${oldSubscriptionId} after upgrade to ${subscriptionId}`);
              } catch (cancelErr: any) {
                console.warn(`Could not cancel old subscription ${oldSubscriptionId}:`, cancelErr.message);
              }
            }
          }
        } else if (session.mode === "payment" && session.metadata?.type === "topup_credits") {
          const userId = session.metadata?.userId;
          const creditsToAdd = parseInt(session.metadata?.credits || "100", 10);

          if (userId) {
            await prisma.userSettings.update({
              where: { userId },
              data: {
                aiCredits: { increment: creditsToAdd },
              },
            }).catch(() => {});
            console.log(`[Stripe] Doładowano jednorazowo ${creditsToAdd} Kredytów AI dla userId=${userId}.`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;
        
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId }
        });

        if (user) {
          const newStatus = (subscription as any).status as string;
          const isActive = newStatus === 'active' || newStatus === 'trialing';

          // Ignoruj tworzenie 'incomplete' na etapie samego wygenerowania koszyka, zanim uzytkownik zaplaci
          if (newStatus === 'incomplete') {
            console.log(`[Stripe] Ignorowanie aktualizacji subskrypcji ${subscription.id} - status incomplete (koszyk nieoplacony).`);
            break;
          }

          // Ochrona przed zjawiskiem wyścigu (race condition) przy upgrade planów
          if (user.stripeSubscriptionId && user.stripeSubscriptionId !== subscription.id) {
            if (!isActive && (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing')) {
              console.log(`[Stripe] Ignorowanie aktualizacji starej/anulowanej subskrypcji ${subscription.id} dla userId=${user.id}`);
              break;
            }
          }

          const periodEndTs = (subscription as any).current_period_end
            || (subscription as any).items?.data?.[0]?.current_period_end
            || (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);


          // Sprawdzamy czy to nowa subskrypcja aktywowana przez Stripe Elements
          const wasIncomplete = previousAttributes?.status === 'incomplete';
          const isNewlyActivated = wasIncomplete && isActive;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId: (subscription as any).id,
              stripePriceId: (subscription as any).items?.data?.[0]?.price?.id || "",
              stripeCurrentPeriodEnd: new Date(periodEndTs * 1000),
              subscriptionStatus: newStatus,
            },
          });

          // If the user changed their plan (e.g. upgraded/downgraded via billing portal or API)
          const previousPriceId = previousAttributes?.items?.data?.[0]?.price?.id;
          const currentPriceId = (subscription as any).items?.data?.[0]?.price?.id;
          const isPlanChange = previousPriceId && currentPriceId && previousPriceId !== currentPriceId;

          if (isPlanChange && isActive) {
            const newLimits = getPlanLimits(currentPriceId);
            await prisma.userSettings.update({
              where: { userId: user.id },
              data: {
                aiCredits: newLimits.credits === Infinity ? 99999999 : newLimits.credits,
              },
            }).catch(() => {});
            console.log(`[Stripe] Plan zmieniony dla userId=${user.id} z ${previousPriceId} na ${currentPriceId}. Zresetowano kredyty.`);
          }

          // NEW SUBSCRIPTION SETUP (from Elements)
          if (isNewlyActivated) {
            const userId = user.id;
            const oldSubscriptionId = subscription.metadata?.oldSubscriptionId;

            // Reset monthly usage on new subscription and AUTO-ENABLE the AI agent
            await prisma.userSettings.upsert({
              where: { userId },
              update: {
                aiCredits: getPlanLimits((subscription as any).items?.data?.[0]?.price?.id).credits === Infinity ? 99999999 : getPlanLimits((subscription as any).items?.data?.[0]?.price?.id).credits,
                autoReply: true,
              },
              create: {
                userId,
                aiCredits: getPlanLimits((subscription as any).items?.data?.[0]?.price?.id).credits === Infinity ? 99999999 : getPlanLimits((subscription as any).items?.data?.[0]?.price?.id).credits,
                autoReply: true,
                onboardingDone: false,
                replyTone: 'PROFESJONALNY',
              }
            });

            console.log(`[Stripe Elements] Subskrypcja aktywowana dla userId=${userId}. autoReply=true.`);

            // Send premium welcome email
            const toEmail = user.email;
            if (toEmail) {
              await sendSystemWelcomeEmail(toEmail).catch((welcomeErr) => {
                console.error(`[Welcome Email] Failed to send welcome email to ${toEmail}:`, welcomeErr.message);
              });
            }

            // Cancel the OLD subscription immediately if this was an upgrade
            if (oldSubscriptionId && oldSubscriptionId !== subscription.id) {
              try {
                await stripe.subscriptions.cancel(oldSubscriptionId);
                console.log(`Cancelled old subscription ${oldSubscriptionId} after upgrade to ${subscription.id}`);
              } catch (cancelErr: any) {
                console.warn(`Could not cancel old subscription ${oldSubscriptionId}:`, cancelErr.message);
              }
            }
          }

          // If subscription becomes inactive (past_due, unpaid, paused) → stop the agent
          if (!isActive) {
            await prisma.userSettings.update({
              where: { userId: user.id },
              data: { autoReply: false },
            }).catch(() => {});
            console.log(`[Stripe] Subskrypcja ${newStatus} dla userId=${user.id} → autoReply=false`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId }
        });

        if (user) {
          // Ochrona: jeśli anulowana subskrypcja to stara subskrypcja, a użytkownik ma nową aktywną - ignoruj!
          if (user.stripeSubscriptionId && user.stripeSubscriptionId !== subscription.id) {
            console.log(`[Stripe] Ignorowanie eventu deleted dla starej subskrypcji ${subscription.id} (użytkownik ma aktywną inną: ${user.stripeSubscriptionId})`);
            break;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionStatus: "canceled" },
          });
          // Turn off auto-reply when subscription expires
          await prisma.userSettings.update({
            where: { userId: user.id },
            data:  { autoReply: false },
          });
          console.log(`[Stripe] Subskrypcja anulowana dla userId=${user.id}. autoReply=false automatycznie.`);
        }
        break;
      }
      
      case "invoice.payment_succeeded": {
        // When a recurring payment succeeds — reset credits, fix status, re-enable agent
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        // Skip if this is the very first invoice (handled by checkout.session.completed)
        const billingReason = (invoice as any).billing_reason as string;
        if (subscriptionId && billingReason !== 'subscription_create') {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = (subscription as any).customer as string;
          
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId }
          });
          
          if (user) {
            const priceId = (subscription as any).items?.data?.[0]?.price?.id;
            const newStatus = (subscription as any).status as string;
            const periodEndTs = (subscription as any).current_period_end || (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);

            // Reset credits and fix subscription status (may have been past_due)
            await Promise.all([
              prisma.userSettings.update({
                where: { userId: user.id },
                data: {
                  aiCredits: getPlanLimits(priceId).credits === Infinity ? 99999999 : getPlanLimits(priceId).credits,
                  autoReply: true, // Re-enable agent if it was paused due to failed payment
                }
              }),
              prisma.user.update({
                where: { id: user.id },
                data: {
                  subscriptionStatus: newStatus,
                  stripePriceId: priceId,
                  stripeCurrentPeriodEnd: new Date(periodEndTs * 1000),
                }
              })
            ]);
            console.log(`[Stripe] Płatność cykliczna zaliczona dla userId=${user.id}. Kredyty zresetowane, status=${newStatus}.`);
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata?.type === "topup_credits") {
          const userId = paymentIntent.metadata?.userId;
          const creditsToAdd = parseInt(paymentIntent.metadata?.credits || "100", 10);

          if (userId) {
            await prisma.userSettings.update({
              where: { userId },
              data: {
                aiCredits: { increment: creditsToAdd },
              },
            }).catch(() => {});
            console.log(`[Stripe] Doładowano jednorazowo (Elements PaymentIntent) ${creditsToAdd} Kredytów AI dla userId=${userId}.`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
