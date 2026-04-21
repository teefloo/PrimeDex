import { Metadata } from 'next';
import { LayoutGrid } from 'lucide-react';
import { TCGCardGrid } from '@/components/tcg/TCGCardGrid';
import Header from '@/components/layout/Header';
import PageHeader from '@/components/layout/PageHeader';
import { t } from '@/lib/server-i18n';

export const metadata: Metadata = {
  title: t('tcg.page_title'),
  description: t('tcg.page_description'),
};

export default function TCGPage() {
  return (
    <div className="app-page">
      {/* ── GLOBAL NAVIGATION ── */}
      <Header />

      {/* ── IMMERSIVE BACKDROP ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[10%] -right-[5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_80%)] opacity-40" />
      </div>

      <main className="page-shell py-8 pb-24 relative">
        <PageHeader
          title={t('tcg.page_heading')}
          eyebrow={t('tcg.page_eyebrow', { defaultValue: 'Catalog' })}
          subtitle={t('tcg.page_subheading')}
          icon={LayoutGrid}
          className="mt-16 md:mt-20"
        />

        <TCGCardGrid />
      </main>


    </div>
  );
}
