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
    <div className="page-shell min-h-screen px-4 py-24 text-foreground">
      <div className="section-frame mx-auto flex max-w-lg flex-col items-center px-6 py-10 text-center md:px-8 md:py-12">
        <div className="mb-4 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-orange-500">
          404
        </div>
        <p className="page-eyebrow justify-center">PrimeDex</p>
        <h1 className="mb-4 text-2xl font-black">
          {t('common.not_found_title', { defaultValue: 'Page Not Found' })}
        </h1>
        <p className="mb-8 leading-relaxed text-foreground/60">
          {t('common.not_found_desc', { defaultValue: "The Pokémon you're looking for might have fled! The page doesn't exist or has been moved." })}
        </p>

        <nav aria-label="Quick navigation" className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="glass-btn px-6 py-3 font-bold"
          >
            {t('common.browse_pokedex', { defaultValue: 'Browse Pokédex' })}
          </Link>
          <Link
            href="/team"
            className="glass-btn px-6 py-3 font-bold"
          >
            {t('nav.team')}
          </Link>
          <Link
            href="/quiz"
            className="glass-btn px-6 py-3 font-bold"
          >
            {t('quiz.title')}
          </Link>
        </nav>

        <div className="mt-12 space-y-1 text-xs text-foreground/30">
          <p>{t('common.more_tools', { defaultValue: 'More tools from PrimeDex:' })}</p>
          <div className="flex flex-wrap justify-center gap-2">
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
