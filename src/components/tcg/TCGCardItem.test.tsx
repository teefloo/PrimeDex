import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import i18n from '@/lib/i18n';
import type { TCGCard } from '@/types/tcg';
import { TCGCardItem } from './TCGCardItem';

vi.mock('next/image', () => ({
  default: (props: { alt?: string; src?: string }) => (
    <div role="img" aria-label={props.alt || ''} data-src={props.src || ''} />
  ),
}));

const baseCard: TCGCard = {
  id: 'sv1-1',
  localId: '001',
  name: 'Charizard',
  image: 'https://assets.tcgdex.net/en/base/base1/001',
  rarity: 'Rare Holo VMAX',
  category: 'Pokemon',
  stage: 'VMAX',
};

describe('TCGCardItem', () => {
  it('renders the art-led grid card in default mode', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TCGCardItem card={baseCard} />
      </I18nextProvider>
    );

    const button = screen.getByRole('button', { name: i18n.t('tcg.open_card_detail', { name: baseCard.name }) });

    expect(button.closest('[data-rarity]')).toHaveAttribute('data-rarity', 'rare holo vmax');
    expect(screen.getByRole('img', { name: baseCard.name })).toBeInTheDocument();
  });

  it('renders the same card-only surface in list mode', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TCGCardItem card={baseCard} variant="list" />
      </I18nextProvider>
    );

    expect(screen.getByRole('button', { name: i18n.t('tcg.open_card_detail', { name: baseCard.name }) })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: baseCard.name })).toBeInTheDocument();
  });
});
