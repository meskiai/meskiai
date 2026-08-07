const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });

async function test() {
  try {
    const customer = await stripe.customers.create({ email: 'test_elements@example.com' });
    console.log("Customer created:", customer.id);

    const PRICE_BASIC = 'price_1TwUOYFzXC0AYLvXgDvOKUnC';
    
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: PRICE_BASIC }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
    });

    console.log("Subscription status:", subscription.status);
    console.log("Latest invoice:", typeof subscription.latest_invoice);
    if (subscription.latest_invoice) {
        console.log("Latest invoice total:", subscription.latest_invoice.total);
        console.log("Payment intent on invoice:", typeof subscription.latest_invoice.payment_intent);
        if (subscription.latest_invoice.payment_intent) {
             console.log("Client secret PI:", subscription.latest_invoice.payment_intent.client_secret);
        }
    }
    console.log("Pending setup intent:", typeof subscription.pending_setup_intent);
    if (subscription.pending_setup_intent) {
        console.log("Client secret SETI:", subscription.pending_setup_intent.client_secret);
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

test();
