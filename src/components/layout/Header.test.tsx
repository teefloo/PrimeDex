import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/lib/i18n';
import { usePrimeDexStore } from '@/store/primedex';
import Header from './Header';

vi.mock('@/store/primedex', () => ({
  usePrimeDexStore: vi.fn(),
}));

vi.mock('@/lib/api/graphql', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/graphql')>('@/lib/api/graphql');
  return {
    ...actual,
    getAllPokemonSummary: vi.fn().mockResolvedValue([]),
  };
});

vi.mock('./SettingsModal', () => ({
  default: () => null,
}));

vi.mock('@/components/ui/tooltip', () => {
  const FragmentWrapper = ({ children }: { children?: ReactNode }) => <>{children}</>;

  return {
    Tooltip: FragmentWrapper,
    TooltipContent: FragmentWrapper,
    TooltipProvider: FragmentWrapper,
    TooltipTrigger: FragmentWrapper,
  };
});

vi.mock('@/components/ui/sheet', () => {
  const FragmentWrapper = ({ children }: { children?: ReactNode }) => <>{children}</>;
  const RenderWrapper = ({
    children,
    render,
  }: {
    children?: ReactNode;
    render?: ReactNode;
  }) => <>{render ?? children}</>;

  return {
    Sheet: FragmentWrapper,
    SheetTrigger: RenderWrapper,
    SheetContent: FragmentWrapper,
    SheetHeader: FragmentWrapper,
    SheetTitle: FragmentWrapper,
    SheetClose: RenderWrapper,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

const mockedUsePrimeDexStore = vi.mocked(usePrimeDexStore);

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <Header />
      </QueryClientProvider>
    </I18nextProvider>
  );
}

beforeEach(() => {
  mockedUsePrimeDexStore.mockReturnValue({
    toggleSettings: vi.fn(),
    theme: 'system',
    setTheme: vi.fn(),
    caughtPokemon: [],
    compareList: [],
    language: 'en',
    setLanguage: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn(),
    systemLanguage: 'en',
  } as never);
});

describe('Header', () => {
  it('labels the header search input for accessibility', () => {
    renderHeader();

    expect(screen.getByLabelText(i18n.t('search.placeholder'))).toBeInTheDocument();
  });

  it('shows compare in the desktop navigation', () => {
    renderHeader();

    const compareLinks = screen.getAllByRole('link', { name: /compare/i });
    expect(compareLinks.some((link) => link.getAttribute('href') === '/compare')).toBe(true);
  });

  it('shows the TCG catalog in the desktop navigation', () => {
    renderHeader();

    const tcgLinks = screen.getAllByRole('link', { name: /tcg catalog/i });
    expect(tcgLinks.some((link) => link.getAttribute('href') === '/tcg')).toBe(true);
  });
});
