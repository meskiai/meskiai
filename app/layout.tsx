import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MESKIAI",
  description: "Inteligentny asystent e-mail dla Twojej firmy.",
  keywords: ["AI email agent", "email automation", "B2B AI assistant", "automated email replies", "meskiai"],
  verification: {
    google: "8vBRb58Hy261nwNRfWy_qTdnez3reAy6dGjoMhfUGqU",
  },
  icons: {
    icon: "/logo.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
