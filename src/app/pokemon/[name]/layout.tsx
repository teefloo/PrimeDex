import { Metadata } from 'next';
import { getPokemonDetail } from '@/lib/api';

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = (await params).name;
  try {
    const pokemon = await getPokemonDetail(name);
    const displayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const types = pokemon.types.map(t => t.type.name).join(', ');
    const artwork = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    
    return {
      title: `${displayName} — Pokédex`,
      description: `Discover ${displayName}, a ${types} type Pokémon. Stats, evolutions, builds, and more.`,
      openGraph: {
        title: `${displayName} — Pokédex`,
        description: `Discover ${displayName}, a ${types} type Pokémon. Stats, evolutions, builds, and more.`,
        images: [{ url: artwork || '' }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${displayName} — Pokédex`,
        description: `Discover ${displayName}, a ${types} type Pokémon. Stats, evolutions, builds, and more.`,
        images: [artwork || ''],
      }
    };
  } catch {
    return {
      title: 'Pokémon Details — Pokédex',
    };
  }
}

export default function PokemonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
