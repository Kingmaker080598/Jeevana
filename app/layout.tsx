import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Playfair_Display, Poppins } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    card: "summary_large_image",
    title: "Jeevana — Life events, in the order they happen",
    description:
      "Jeevana turns scattered government services into one clear path through life's major events. Built for India, piloted in Andhra Pradesh.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${plexMono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
