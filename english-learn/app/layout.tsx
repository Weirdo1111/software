import type { Metadata } from "next";

import { AnalyticsProvider } from "@/components/analytics-provider";
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
        <div className="relative z-[1] min-h-screen">
          <AnalyticsProvider />
          {children}
        </div>
      </body>
    </html>
  );
}
