import { describe, expect, it } from 'vitest';
import { getBaseSpeciesName, getFormDisplayName } from './form-names';

describe('getFormDisplayName', () => {
  it('keeps the base name for regular species', () => {
    expect(getFormDisplayName('pikachu', 'Pikachu', 'en')).toBe('Pikachu');
  });

  it('formats regional forms through the lookup table', () => {
    expect(getFormDisplayName('braviary-hisui', 'Braviary', 'en')).toBe('Braviary-Hisui');
    expect(getFormDisplayName('giratina-origin', 'Giratina', 'es')).toBe('Giratina-Origen');
  });

  it('normalizes malformed double-dash form names', () => {
    expect(getFormDisplayName('braviary--hisui', 'Braviary', 'ja')).toBe('Braviary-Hisui');
    expect(getFormDisplayName('giratina--origin', 'Giratina', 'fr')).toBe('Giratina-Origin');
  });

  it('keeps alternate mega forms readable', () => {
    expect(getFormDisplayName('charizard-mega-x', 'Charizard', 'en')).toBe('Charizard-Mega X');
  });

  it('formats Pikachu special forms explicitly', () => {
    expect(getFormDisplayName('pikachu-original-cap', 'Pikachu', 'en')).toBe('Pikachu-Original Cap');
    expect(getFormDisplayName('pikachu-hoenn-cap', 'Pikachu', 'en')).toBe('Pikachu-Hoenn Cap');
    expect(getFormDisplayName('pikachu-rock-star', 'Pikachu', 'en')).toBe('Pikachu-Rock Star');
    expect(getFormDisplayName('pikachu-pop-star', 'Pikachu', 'en')).toBe('Pikachu-Pop Star');
    expect(getFormDisplayName('pikachu-belle', 'Pikachu', 'en')).toBe('Pikachu-Belle');
    expect(getFormDisplayName('pikachu-phd', 'Pikachu', 'en')).toBe('Pikachu-PhD');
    expect(getFormDisplayName('pikachu-libre', 'Pikachu', 'en')).toBe('Pikachu-Libre');
    expect(getFormDisplayName('pikachu-libre', 'Pikachu-Libre', 'en')).toBe('Pikachu-Libre');
  });

  it('derives the correct base species for cap forms', () => {
    expect(getBaseSpeciesName('pikachu-original-cap')).toBe('pikachu');
    expect(getBaseSpeciesName('pikachu-world-cap')).toBe('pikachu');
    expect(getBaseSpeciesName('mr-mime-galar')).toBe('mr-mime');
  });
});
