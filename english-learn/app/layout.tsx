import type { Metadata } from "next";

import { AnalyticsProvider } from "@/components/analytics-provider";
import { BuddyXpToastHost } from "@/components/buddy-xp-toast-host";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Learn Academic",
  description: "Assessment-led academic English learning platform for university students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AnalyticsProvider />
        {children}
        <BuddyXpToastHost />
      </body>
    </html>
  );
}
