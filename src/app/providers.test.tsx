import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Providers from './providers';
import { usePrimeDexStore } from '@/store/primedex';
import { loadLanguage } from '@/lib/i18n';

vi.mock('@/store/primedex', () => ({
  usePrimeDexStore: vi.fn(),
}));

vi.mock('@/lib/i18n', async () => {
  const actual = await vi.importActual<typeof import('@/lib/i18n')>('@/lib/i18n');
  return {
    ...actual,
    loadLanguage: vi.fn().mockResolvedValue(undefined),
  };
});

type ProviderStoreState = {
  _hasHydrated: boolean;
  language: string;
  systemLanguage: string;
  theme: 'light' | 'dark' | 'system';
  setSystemLanguage: ReturnType<typeof vi.fn>;
};

const mockedUsePrimeDexStore = vi.mocked(usePrimeDexStore);
const mockedLoadLanguage = vi.mocked(loadLanguage);

let storeState: ProviderStoreState;

beforeEach(() => {
  storeState = {
    _hasHydrated: false,
    language: 'auto',
    systemLanguage: 'en',
    theme: 'system',
    setSystemLanguage: vi.fn(),
  };

  mockedUsePrimeDexStore.mockImplementation(() => storeState as never);
  mockedLoadLanguage.mockClear();
  document.documentElement.lang = 'en';
});

afterEach(() => {
  cleanup();
});

describe('Providers', () => {
  it('renders children before hydration completes', () => {
    render(
      <Providers>
        <div>ready</div>
      </Providers>
    );

    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('updates the document lang when the resolved language changes', async () => {
    const { rerender } = render(
      <Providers>
        <div>ready</div>
      </Providers>
    );

    storeState = {
      ...storeState,
      _hasHydrated: true,
      language: 'fr',
      theme: 'light',
    };

    rerender(
      <Providers>
        <div>ready</div>
      </Providers>
    );

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('fr');
    });
    expect(mockedLoadLanguage).toHaveBeenCalledWith('fr');

    storeState = {
      ...storeState,
      language: 'es',
    };

    rerender(
      <Providers>
        <div>ready</div>
      </Providers>
    );

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('es');
    });
    expect(mockedLoadLanguage).toHaveBeenCalledWith('es');
  });
});
