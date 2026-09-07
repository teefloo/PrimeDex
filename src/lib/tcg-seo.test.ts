import { describe, expect, it } from 'vitest';

import { PUBLIC_TCG_CARD_ROBOTS } from './tcg-seo';

describe('public TCG card robots policy', () => {
  it('keeps every valid public card URL indexable for web search', () => {
    expect(PUBLIC_TCG_CARD_ROBOTS).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    });
  });
});
