import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokémon Quiz - PrimeDex",
  description: "Test your Pokémon knowledge with interactive quizzes. Identify Pokémon by silhouette, type, and more.",
  openGraph: {
    title: "Pokémon Quiz - PrimeDex",
    description: "Test your Pokémon knowledge with interactive quizzes.",
  },
  twitter: {
    title: "Pokémon Quiz - PrimeDex",
    description: "Test your Pokémon knowledge with interactive quizzes.",
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
