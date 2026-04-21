import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/lib/i18n';
import { useMounted } from '@/hooks/useMounted';
import { getFilterOptions, getRaritiesForSet } from '@/lib/api/tcg';
import { TCGFilters } from './TCGFilters';

vi.mock('@/hooks/useMounted', () => ({
  useMounted: vi.fn(),
}));

vi.mock('@/store/primedex', () => ({
  usePrimeDexStore: () => ({ language: 'en' }),
}));

vi.mock('@/lib/api/tcg', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/tcg')>('@/lib/api/tcg');
  return {
    ...actual,
    getFilterOptions: vi.fn(),
    getRaritiesForSet: vi.fn(),
  };
});

vi.mock('@/components/ui/PokeballIcon', () => ({
  PokeballIcon: () => null,
}));

vi.mock('next/image', () => ({
  default: (props: { alt?: string }) => <div aria-label={props.alt || ''} />,
}));

const mockedUseMounted = vi.mocked(useMounted);
const mockedGetFilterOptions = vi.mocked(getFilterOptions);
const mockedGetRaritiesForSet = vi.mocked(getRaritiesForSet);

beforeEach(() => {
  mockedUseMounted.mockReturnValue(true);
  mockedGetFilterOptions.mockResolvedValue({
    categories: ['all', 'Pokemon', 'Trainer', 'Energy'],
    sets: [
      { id: 'sv99', name: 'Omega Set', totalCards: 1, releaseDate: '2025-01-01' },
      { id: 'sv01', name: 'Base Set', totalCards: 1, releaseDate: '2023-01-01' },
      { id: 'xy99', name: 'Alpha Set', totalCards: 1, releaseDate: '2024-01-01' },
    ],
    pokemonTypes: ['Fire', 'Water'],
    trainerTypes: ['Item', 'Supporter'],
    energyTypes: ['Basic', 'Special'],
    stages: ['Basic', 'Stage1'],
    rarities: [],
  });
  mockedGetRaritiesForSet.mockResolvedValue(['Common']);
});

describe('TCGFilters', () => {
  it('defaults to the latest set when no set is selected', async () => {
    const onChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <TCGFilters
            filters={{
              sortBy: 'name',
              sortOrder: 'asc',
            }}
            onChange={onChange}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedSet: 'sv99',
        }),
      );
    });
  });

  it('clears an invalid rarity when the set rarities change', async () => {
    const onChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <TCGFilters
            filters={{
              selectedSet: 'sv01',
              selectedRarity: 'Rare',
              sortBy: 'name',
              sortOrder: 'asc',
            }}
            onChange={onChange}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedSet: 'sv01',
          selectedRarity: null,
        }),
      );
    });
  });

  it('clears incompatible Pokémon filters when switching to trainer cards', async () => {
    const onChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <TCGFilters
            filters={{
              selectedCategory: 'Pokemon',
              selectedTypes: ['Fire'],
              selectedPhase: 'Basic',
              selectedTrainerTypes: ['Item'],
              selectedEnergyTypes: ['Basic'],
              minHp: 100,
              maxHp: 200,
              sortBy: 'name',
              sortOrder: 'asc',
            }}
            onChange={onChange}
          />
        </QueryClientProvider>
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: i18n.t('tcg.card_category_trainer') }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedCategory: 'Trainer',
        selectedTypes: [],
        selectedPhase: null,
        selectedTrainerTypes: ['Item'],
        selectedEnergyTypes: [],
        minHp: undefined,
        maxHp: undefined,
      }),
    );
  });
});
