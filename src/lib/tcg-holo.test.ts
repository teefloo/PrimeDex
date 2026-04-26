import { describe, expect, it } from 'vitest';
import type { TCGCard } from '@/types/tcg';
import { getTCGHoloData, getTCGHoloRarity } from './tcg-holo';

const baseCard: TCGCard = {
  id: 'sv1-001',
  localId: '001',
  name: 'Bulbasaur',
  image: 'https://assets.tcgdex.net/en/sv/sv1/001',
  category: 'Pokemon',
};

describe('tcg holo mapping', () => {
  it.each([
    ['Common', 'common'],
    ['Uncommon', 'uncommon'],
    ['Rare', 'rare'],
    ['Rare Holo', 'rare holo'],
    ['Rare Holo Cosmos', 'rare holo cosmos'],
    ['Rare Holo V', 'rare holo v'],
    ['Rare Holo VMAX', 'rare holo vmax'],
    ['Rare Holo VSTAR', 'rare holo vstar'],
    ['Rare Rainbow', 'rare rainbow'],
    ['Rare Secret', 'rare secret'],
    ['Amazing Rare', 'amazing rare'],
    ['Radiant Rare', 'radiant rare'],
    ['Ultra Rare', 'rare ultra'],
    ['Illustration Rare', 'rare ultra'],
    ['Special Illustration Rare', 'rare ultra'],
    ['Hyper Rare', 'rare secret'],
    ['Double Rare', 'rare holo v'],
  ])('maps %s to the pokemon-cards-css rarity %s', (rarity, expected) => {
    expect(getTCGHoloRarity({ ...baseCard, rarity })).toBe(expected);
  });

  it('detects trainer gallery numbers for data attributes', () => {
    const data = getTCGHoloData({
      ...baseCard,
      id: 'swsh11tg-TG03',
      localId: 'TG03',
      rarity: 'Trainer Gallery Rare Holo',
      set: { id: 'swsh11tg', name: 'Lost Origin Trainer Gallery' },
    });

    expect(data.rarity).toBe('trainer gallery rare holo');
    expect(data.isTrainerGallery).toBe(true);
  });

  it('keeps basic rarities effect-free', () => {
    expect(getTCGHoloData({ ...baseCard, rarity: 'Common' }).hasHoloEffect).toBe(false);
    expect(getTCGHoloData({ ...baseCard, rarity: 'Rare Holo' }).hasHoloEffect).toBe(true);
  });

  it('uses TCGdex holo variants to distinguish classic rare holos', () => {
    expect(getTCGHoloRarity({
      ...baseCard,
      rarity: 'Rare',
      variants: { firstEdition: true, holo: true, normal: false, reverse: false, wPromo: false },
    })).toBe('rare holo');
  });
});
