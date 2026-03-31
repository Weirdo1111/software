import type { Metadata } from "next";
import { Suspense } from "react";

import { AnalyticsProvider } from "@/components/analytics-provider";
import { GlobalBuddyCompanion } from "@/components/global-buddy-companion";
import { NavigationLoadingOverlay } from "@/components/navigation-loading-overlay";
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
        <Suspense fallback={null}>
          <GlobalBuddyCompanion />
        </Suspense>
        <Suspense fallback={null}>
          <NavigationLoadingOverlay />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
