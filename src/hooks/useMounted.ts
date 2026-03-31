'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true after the component has mounted on the client.
 * Used to prevent hydration mismatches when rendering client-only content.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
