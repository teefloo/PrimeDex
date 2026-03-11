import type { Metadata } from "next";
import { Nunito, Geist } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Agentation } from "agentation";
import CompareBar from "@/components/pokemon/CompareBar";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const mainFont = Nunito({
  weight: ["400", "600", "700", "800"],
  variable: "--font-main",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokédex — Explore All Pokémon | Generation 1-9",
  description: "A beautiful, premium neumorphic Pokédex. Explore, search, and filter all Pokémon from Generation 1 to 9 with detailed stats, evolutions, and variations.",
  keywords: ["Pokédex", "Pokémon", "PokeAPI", "Pokedex", "Pokemon", "Digital Pokédex", "Next.js", "Soft UI", "Team Builder", "Pokemon Quiz", "Competitive Pokemon"],
  authors: [{ name: "Ultra Pokédex Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Pokédex — Explore All Pokémon",
    description: "Discover every Pokémon with our beautiful neumorphic Pokédex. Stats, types, evolutions and more.",
    type: "website",
    siteName: "Ultra Pokédex",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokédex — Explore All Pokémon",
    description: "Explore the world of Pokémon with our sleek soft-UI Pokédex.",
  }
};

import { Onboarding } from "@/components/layout/Onboarding";
import { AppContent } from "./AppContent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${mainFont.variable} antialiased bg-background text-foreground font-main`}>
        <Providers>
          <AppContent>
            {children}
          </AppContent>
          <CompareBar />
          <Onboarding />
          {process.env.NODE_ENV === "development" && <Agentation />}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
