import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Type Master — Learn Pokémon Type Matchups",
  description: "Master Pokémon type advantages, weaknesses, and resistances. Explore emblematic Pokémon for each type.",
};

export default function TypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
