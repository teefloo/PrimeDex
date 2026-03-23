'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { label: t('common.home'), href: '/', icon: true },
    ...pathSegments.map((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
      
      // Handle special cases for labels
      let label = segment;
      if (segment === 'pokemon') label = t('common.pokemon');
      else if (segment.match(/^[0-9]+$/)) label = `#${segment}`; // Pokemon ID
      else label = segment.charAt(0).toUpperCase() + segment.slice(1);

      return { label, href, icon: false };
    })
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `https://primedex.vercel.app${crumb.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav 
        aria-label="Breadcrumb" 
        className="w-full relative z-40"
      >
        <div className="container mx-auto px-6 md:px-12 pt-24 pb-4">
          <ol className="flex items-center space-x-2 list-none p-0 m-0 text-[10px] md:text-xs font-medium text-foreground/30">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronRight className="w-3 h-3 mx-1.5 opacity-20" />}
                <Link
                  href={crumb.href}
                  className={cn(
                    "hover:text-primary transition-colors flex items-center gap-1.5",
                    index === breadcrumbs.length - 1 ? "text-foreground/60 font-bold pointer-events-none" : ""
                  )}
                  aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                >
                  {crumb.icon && <Home className="w-3 h-3" />}
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
