'use client';

import dynamic from 'next/dynamic';
import { History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const RecentlyViewed = dynamic(() => import('@/components/pokemon/RecentlyViewed'), {
  ssr: false,
  loading: () => (
    <section className="mt-4 px-4 min-h-[18rem]" aria-hidden="true">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/50 rounded-xl border border-border/60">
            <History className="w-5 h-5 text-foreground/60" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="glass-panel p-3 rounded-2xl flex flex-col items-center text-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-8 rounded-full mx-auto" />
              <Skeleton className="h-3 w-14 rounded-full mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </section>
  ),
});

export default function ClientRecentlyViewed() {
  return <RecentlyViewed />;
}
