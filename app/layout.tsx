import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: 'swap' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-plus-jakarta", display: 'swap' });

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
    <html lang="pl" suppressHydrationWarning className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className={inter.className}>
        <Providers>
          <MetaPixel />
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
