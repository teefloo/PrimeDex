import { Loader2 } from 'lucide-react';
import { t } from '@/lib/server-i18n';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-2xl">
      <div role="status" aria-live="polite" className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
        <span className="sr-only">{t('loading.title')}</span>
      </div>
      <p className="page-eyebrow mt-8 justify-center">PrimeDex</p>
      <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.28em] text-foreground/40 animate-pulse">
        {t('loading.title')}
      </h2>
      <p className="mt-2 text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
        {t('loading.subtitle')}
      </p>
    </div>
  );
}
