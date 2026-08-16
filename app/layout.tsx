import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-dm",
  display: 'swap'
});

const jakarta = dmSans; // alias so rest of code still compiles

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "MESKIAI",
  description: "Inteligentny asystent e-mail dla Twojej firmy.",
  keywords: ["AI email agent", "email automation", "AI assistant", "automated email replies", "meskiai"],
  verification: {
    google: "8vBRb58Hy261nwNRfWy_qTdnez3reAy6dGjoMhfUGqU",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    title: "meskiai",
    description: "Inteligentny asystent e-mail dla Twojej firmy.",
    images: [{ url: "/logo.png" }],
    url: "https://meskiai.com",
    siteName: "meskiai",
    type: "website",
  },
  metadataBase: new URL("https://meskiai.com"),
};

import { Providers } from "./providers";
import CookieBanner from "./components/CookieBanner";
import { MetaPixel } from "./components/MetaPixel";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning className={dmSans.variable}>
      <body className={dmSans.className}>
        <Providers>
          <MetaPixel />
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
