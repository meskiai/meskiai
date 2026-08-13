"use client";

import { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

const PIXEL_ID = "28282792124647343";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

// Inner component uses useSearchParams — must be inside <Suspense>
function MetaPixelEvents() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track PageView on every route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  // Track Purchase when user returns from Stripe checkout with ?checkout=success
  useEffect(() => {
    const isCheckoutSuccess = searchParams.get("checkout") === "success";

    if (
      isCheckoutSuccess &&
      pathname === "/dashboard" &&
      typeof window !== "undefined" &&
      window.fbq
    ) {
      const storageKey = "meta_purchase_fired_last";
      const lastFired = sessionStorage.getItem(storageKey);
      const now = Date.now();

      // Prevent double-firing within 60 seconds
      if (!lastFired || now - parseInt(lastFired) > 60000) {
        window.fbq("track", "Purchase", {
          currency: "PLN",
          value: 299,
          content_name: "MESKIAI Subscription",
          content_type: "product",
        });
        sessionStorage.setItem(storageKey, now.toString());
        console.log("[MetaPixel] Purchase event fired ✅");
      }
    }
  }, [pathname, searchParams]);

  // Track CompleteRegistration when user lands on /dashboard for the first time
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user &&
      pathname === "/dashboard" &&
      typeof window !== "undefined" &&
      window.fbq
    ) {
      const key = `meta_registration_fired_${session.user.email}`;
      if (!sessionStorage.getItem(key)) {
        window.fbq("track", "CompleteRegistration", {
          content_name: "MESKIAI Dashboard",
          status: true,
        });
        sessionStorage.setItem(key, "1");
      }
    }
  }, [status, session, pathname]);

  return null;
}

// Outer component — renders pixel script + wraps events in Suspense
export function MetaPixel() {
  return (
    <>
      {/* Meta Pixel base code */}
      <Script
        id="meta-pixel"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* Noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {/* Suspense required by Next.js for useSearchParams() */}
      <Suspense fallback={null}>
        <MetaPixelEvents />
      </Suspense>
    </>
  );
}
