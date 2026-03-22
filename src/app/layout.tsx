import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Agentation } from "agentation";
import { t } from '@/lib/server-i18n';
import { AppContent } from "./AppContent";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import Script from "next/script";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://primedex.vercel.app"),
  title: {
    default: t("meta.title"),
    template: "%s | PrimeDex",
  },
  description: t("meta.description"),
  keywords: t("meta.keywords", { returnObjects: true }) as unknown as string[],
  authors: [{ name: t("meta.author"), url: "https://primedex.vercel.app" }],
  creator: "PrimeDex",
  publisher: "PrimeDex",
  applicationName: "PrimeDex",
  category: "games",
  alternates: {
    canonical: "/",
    languages: {
      "en": "/en",
      "fr": "/fr"
    }
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
    url: "/",
    locale: "en_US",
    alternateLocale: ["fr_FR"],
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
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PrimeDex',
    url: 'https://primedex.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://primedex.vercel.app/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PrimeDex',
    url: 'https://primedex.vercel.app',
    logo: 'https://primedex.vercel.app/icon.svg',
    sameAs: [
      'https://twitter.com/primedex',
      'https://github.com/primedex',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-body", displayFont.variable, bodyFont.variable)}>
      <head>
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
        <Providers>
          <Breadcrumbs />
          <AppContent>
            {children}
          </AppContent>
          {process.env.NODE_ENV === "development" && <Agentation />}
        </Providers>
      </body>
    </html>
  );
}
