'use client';

import { Agentation } from "agentation";
import dynamic from "next/dynamic";

const CompareBar = dynamic(() => import("@/components/pokemon/CompareBar").then(mod => mod.default), { ssr: false });
const Toaster = dynamic(() => import("@/components/ui/sonner").then(mod => mod.Toaster), { ssr: false });

export function AppContent({ children }: { children: React.ReactNode }) {
  // useKeyboardShortcuts();
  
  return (
    <>
      {children}
      <CompareBar />
      <Toaster />
      {process.env.NODE_ENV === "development" && (
        <Agentation endpoint="http://localhost:4747" />
      )}
    </>
  );
}
