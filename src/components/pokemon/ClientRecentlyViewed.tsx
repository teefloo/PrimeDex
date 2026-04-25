'use client';

import dynamic from 'next/dynamic';

const RecentlyViewed = dynamic(() => import('@/components/pokemon/RecentlyViewed'), {
  ssr: false,
});

export default function ClientRecentlyViewed() {
  return <RecentlyViewed />;
}
