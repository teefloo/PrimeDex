import { MetadataRoute } from 'next';
import { getAllPokemonNames } from '@/lib/api';

const stableLastModified = new Date('2026-04-21T00:00:00.000Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://primedex.vercel.app';

  // Get all pokemon names to generate dynamic routes
  const pokemonList = await getAllPokemonNames();

  const pokemonUrls: MetadataRoute.Sitemap = pokemonList.map((pokemon) => ({
    url: `${baseUrl}/pokemon/${pokemon.name}`,
    lastModified: stableLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    images: [
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.url.split('/').filter(Boolean).pop()}.png`,
    ],
  }));

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: stableLastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/types`,
      lastModified: stableLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: stableLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: stableLastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: stableLastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: stableLastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tcg`,
      lastModified: stableLastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: stableLastModified,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: stableLastModified,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  return [...staticRoutes, ...pokemonUrls];
}
