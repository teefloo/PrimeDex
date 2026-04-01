'use client';

import { useTranslation } from '@/lib/i18n';

export default function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.04]">
      <div className="py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/20" />
          <span className="text-lg font-black gradient-text-primary tracking-tighter">PrimeDex</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/20" />
        </div>
        <p className="text-[11px] font-semibold text-foreground/25 tracking-wider">
          {t('home.footer_copyright', { year: new Date().getFullYear() })}
        </p>
        <p className="mt-3 text-[10px] text-foreground/15 tracking-wide">
          {t('home.footer_data')}
        </p>
      </div>
    </footer>
  );
}
