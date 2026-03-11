import type { Metadata } from "next";
import { Nunito, Geist } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Agentation } from "agentation";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const mainFont = Nunito({
  weight: ["400", "600", "700", "800"],
  variable: "--font-main",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokédex — Explore All Pokémon | Generation 1-9",
  description: "A beautiful, premium neumorphic Pokédex. Explore, search, and filter all Pokémon from Generation 1 to 9 with detailed stats, evolutions, and variations.",
  keywords: ["Pokédex", "Pokémon", "PokeAPI", "Pokedex", "Pokemon", "Digital Pokédex", "Next.js", "Soft UI"],
  authors: [{ name: "Pokédex Team" }],
  openGraph: {
    title: "Pokédex — Explore All Pokémon",
    description: "Discover every Pokémon with our beautiful neumorphic Pokédex. Stats, types, evolutions and more.",
    type: "website",
    siteName: "Pokédex Generation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokédex — Explore All Pokémon",
    description: "Explore the world of Pokémon with our sleek soft-UI Pokédex.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${mainFont.variable} antialiased bg-background text-foreground font-main`}>
        <Providers>
          {children}
          {process.env.NODE_ENV === "development" && <Agentation />}
        </Providers>
      </body>
    </html>
  );
}
