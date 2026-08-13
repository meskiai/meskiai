"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <ThemeProvider 
      attribute="data-theme" 
      defaultTheme="light" 
      enableSystem={false}
      forcedTheme={isDashboard ? undefined : "light"}
    >
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
