import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jeevana — Life events, in the order they happen",
  description:
    "Jeevana turns scattered government services into one clear path through life's major events. Built for India, piloted in Andhra Pradesh.",
  openGraph: {
    title: "Jeevana — Life events, in the order they happen",
    description:
      "Jeevana turns scattered government services into one clear path through life's major events. Built for India, piloted in Andhra Pradesh.",
  },
  twitter: {
    title: "Jeevana — Life events, in the order they happen",
    description:
      "Jeevana turns scattered government services into one clear path through life's major events. Built for India, piloted in Andhra Pradesh.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
