import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

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
    <html lang="en" className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
