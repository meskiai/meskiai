import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MESKIAI — AI Email Agent",
  description: "MESKIAI is an AI-powered email assistant that automatically reads, analyzes and replies to your business emails 24/7. Designed for B2B companies to automate client communication.",
  keywords: ["AI email agent", "email automation", "B2B AI assistant", "automated email replies", "MESKIAI"],
  verification: {
    google: "s7pLe9Qvw4VmJCsUfAfeMhgYj1YzYXLcCnFdHczK-V8",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "MESKIAI — AI Email Agent",
    description: "AI-powered email assistant that automatically replies to your business emails 24/7.",
    images: [{ url: "/logo.png" }],
    url: "https://meskiai.com",
    siteName: "MESKIAI",
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
    <html lang="pl" className={`${inter.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
