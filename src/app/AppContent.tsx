'use client';

import { Agentation } from "agentation";
import dynamic from "next/dynamic";
import CompareBarSlot from "@/components/pokemon/CompareBarSlot";

const Toaster = dynamic(() => import("@/components/ui/sonner").then(mod => mod.Toaster), { ssr: false });

export function AppContent({ children }: { children: React.ReactNode }) {
  // useKeyboardShortcuts();
  
  return (
    <>
      {children}
      <CompareBarSlot />
      <Toaster />
      {process.env.NODE_ENV === "development" && (
        <Agentation endpoint="http://localhost:4747" />
      )}
    </>
  );
}
