import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorite Pokémon - PrimeDex",
  description: "View your collection of favorite Pokémon. Quick access to all the Pokémon you've marked as favorites.",
  openGraph: {
    title: "Favorite Pokémon - PrimeDex",
    description: "View your collection of favorite Pokémon.",
  },
  twitter: {
    title: "Favorite Pokémon - PrimeDex",
    description: "View your collection of favorite Pokémon.",
  },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
