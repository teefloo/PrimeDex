import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { t } from '@/lib/server-i18n';
import { AppContent } from "./AppContent";
import SiteFooter from "@/components/layout/SiteFooter";
import { getLanguageAlternates, languageToOpenGraphLocale } from "@/lib/languages";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: '#171924',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://primedex.vercel.app"),
  title: {
    default: t("meta.title"),
    template: "%s | PrimeDex",
  },
  description: t("meta.description"),
  keywords: t("meta.keywords", { returnObjects: true }) as unknown as string[],
  authors: [{ name: t("meta.author"), url: process.env.NEXT_PUBLIC_APP_URL || "https://primedex.vercel.app" }],
  creator: "PrimeDex",
  publisher: "PrimeDex",
  applicationName: "PrimeDex",
  category: "games",
  alternates: {
    canonical: "/",
    languages: getLanguageAlternates("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: t("meta.og_title"),
    description: t("meta.og_description"),
    type: "website",
    siteName: t("meta.site_name"),
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PrimeDex — The Ultimate Online Pokédex",
      },
    ],
    locale: languageToOpenGraphLocale.en,
    alternateLocale: Object.values(languageToOpenGraphLocale).filter((locale) => locale !== languageToOpenGraphLocale.en),
  },
  twitter: {
    card: "summary_large_image",
    title: t("meta.twitter_title"),
    description: t("meta.twitter_description"),
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  other: {
    "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "pqXHKXVMghO__JyQJLu-0jC6jNnSgzAa_VsvtSrN_gg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://primedex.vercel.app';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PrimeDex',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PrimeDex',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    sameAs: [
      'https://github.com/Teeflo/PrimeDex',
    ],
  };

  return (
      <html lang="en" suppressHydrationWarning className={cn("font-body", displayFont.variable, bodyFont.variable)}>
      <head>
        {/* DNS Prefetch & Preconnect for external APIs */}
        <link rel="preconnect" href="https://pokeapi.co" />
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
        <link rel="preconnect" href="https://beta.pokeapi.co" />
        <link rel="dns-prefetch" href="https://pokeapi.co" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://beta.pokeapi.co" />
        <script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="antialiased bg-background text-foreground font-body">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-bold"
        >
          Skip to main content
        </a>
         <Providers>
           <AppContent>
             <div id="main-content">
               {children}
             </div>
             <SiteFooter />
           </AppContent>
           {/* <Analytics /> */}
         </Providers>
      </body>
    </html>
  );
}
