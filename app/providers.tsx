"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <SessionProvider>{children}</SessionProvider>
  );
}
