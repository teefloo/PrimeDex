import Link from 'next/link';
import { Metadata } from 'next';
import { t } from '@/lib/server-i18n';

export const metadata: Metadata = {
  title: 'Page Not Found | PrimeDex',
  description: 'The page you are looking for does not exist. Browse our complete Pokédex with all 1025 Pokémon.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-orange-500 mb-4">
          404
        </div>
        <h1 className="text-2xl font-black mb-4">
          {t('common.not_found_title', { defaultValue: 'Page Not Found' })}
        </h1>
        <p className="text-foreground/60 mb-8 leading-relaxed">
          {t('common.not_found_desc', { defaultValue: "The Pokémon you're looking for might have fled! The page doesn't exist or has been moved." })}
        </p>

        <nav aria-label="Quick navigation" className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            {t('common.browse_pokedex', { defaultValue: 'Browse Pokédex' })}
          </Link>
          <Link
            href="/team"
            className="px-6 py-3 bg-secondary border border-border rounded-full font-bold hover:bg-accent transition-colors"
          >
            {t('nav.team')}
          </Link>
          <Link
            href="/quiz"
            className="px-6 py-3 bg-secondary border border-border rounded-full font-bold hover:bg-accent transition-colors"
          >
            {t('quiz.title')}
          </Link>
        </nav>

        <div className="mt-12 text-xs text-foreground/30 space-y-1">
          <p>{t('common.more_tools', { defaultValue: 'More tools from PrimeDex:' })}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/compare" className="hover:text-foreground/50 transition-colors underline">{t('nav.compare')}</Link>
            <span>·</span>
            <Link href="/types" className="hover:text-foreground/50 transition-colors underline">{t('nav.types')}</Link>
            <span>·</span>
            <Link href="/favorites" className="hover:text-foreground/50 transition-colors underline">{t('nav.favorites')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
