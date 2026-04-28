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
        <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_34%),linear-gradient(315deg,rgba(34,211,238,0.08),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,var(--background)_88%)] opacity-70" />
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
