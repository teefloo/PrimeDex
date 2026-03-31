import { Metadata, ResolvingMetadata } from 'next';
import { getPokemonDetail, getPokemonSpecies, getLocalizedPokemonData, getPokemonEncounters } from '@/lib/api';
import { PokemonDetailClient } from './PokemonDetailClient';
import Header from '@/components/layout/Header';
import { PokemonDetail, PokemonSpecies, PokemonEncounter, LocalizedPokemonData } from '@/types/pokemon';
import { t } from '@/lib/server-i18n';

interface Props {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params, searchParams }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { name } = await params;
  const sParams = await searchParams;
  const lang = (sParams.lang as string) || 'en';
  
  try {
    const [pokemon] = await Promise.all([
      getPokemonDetail(name),
      getPokemonSpecies(name),
    ]);
    
    // lang ID 5 is French, 9 is English in PokeAPI GraphQL
    const langId = lang === 'fr' ? 5 : 9;
    const localizedData = await getLocalizedPokemonData(name, langId).catch(() => null) as LocalizedPokemonData | null;
    
    const localizedName = localizedData?.pokemon_v2_pokemonspeciesnames?.[0]?.name || pokemon.name;
    const flavorTexts = localizedData?.pokemon_v2_pokemonspeciesflavortexts || [];
    const description = flavorTexts[0]?.flavor_text?.replace(/\f/g, ' ') || '';

    const title = `${localizedName.charAt(0).toUpperCase() + localizedName.slice(1)} | PrimeDex`;
    const seoDescription = description || `Detailed information about ${localizedName}, including stats, abilities, types, and evolutions.`;

    const image = pokemon.sprites.other?.['official-artwork'].front_default || pokemon.sprites.front_default;

    return {
      title,
      description: seoDescription,
      openGraph: {
        title,
        description: seoDescription,
        type: 'website',
        images: [
          {
            url: image,
            width: 475,
            height: 475,
            alt: localizedName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: seoDescription,
        images: [image],
      },
      keywords: [
        localizedName, 
        'Pokemon', 
        'Pokedex', 
        ...pokemon.types.map(t => t.type.name),
        'PrimeDex',
        'Stats',
        'Abilities'
      ],
    };
  } catch {
    return {
      title: 'Pokemon Not Found | PrimeDex',
    };
  }
}

export async function generateStaticParams() {
  // Pre-render first 151 pokemons for better SEO and performance
  return Array.from({ length: 151 }, (_, i) => ({
    name: (i + 1).toString(),
  }));
}

export default async function PokemonPage({ params, searchParams }: Props) {
  const { name } = await params;
  const sParams = await searchParams;
  const lang = (sParams.lang as string) || 'en';
  const langId = lang === 'fr' ? 5 : 9;

  let pokemon: PokemonDetail;
  let species: PokemonSpecies | null = null;
  let localized: LocalizedPokemonData | null = null;
  let encounters: PokemonEncounter[] = [];

  try {
    const detailData = await getPokemonDetail(name);
    pokemon = detailData;
    
    const [speciesData, localizedData, encountersData] = await Promise.all([
      getPokemonSpecies(name).catch(() => null),
      getLocalizedPokemonData(name, langId).catch(() => null) as Promise<LocalizedPokemonData | null>,
      getPokemonEncounters(detailData.id).catch(() => [])
    ]);

    species = speciesData;
    localized = localizedData;
    encounters = encountersData;
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t('common.pokemon_not_found', { defaultValue: 'Pokemon Not Found' })}</h1>
          <p className="text-muted-foreground">{t('common.pokemon_not_found_desc', { defaultValue: 'The pokemon you are looking for does not exist.' })}</p>
        </div>
      </div>
    );
  }

  const displayName = localized?.pokemon_v2_pokemonspeciesnames?.[0]?.name || pokemon.name;

  // JSON-LD structured data for Pokemon
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'IndividualProduct',
    name: displayName,
    description: localized?.pokemon_v2_pokemonspeciesflavortexts?.[0]?.flavor_text?.replace(/\f/g, ' ') || `Stats and details for ${displayName}`,
    image: pokemon.sprites.other?.['official-artwork'].front_default || pokemon.sprites.front_default,
    sku: pokemon.id.toString(),
    brand: {
      '@type': 'Brand',
      name: 'Pokémon',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Height',
        value: `${pokemon.height / 10} m`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Weight',
        value: `${pokemon.weight / 10} kg`,
      },
      ...pokemon.stats.map(s => ({
        '@type': 'PropertyValue',
        name: s.stat.name,
        value: s.base_stat
      }))
    ],
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PokemonDetailClient 
        initialPokemon={pokemon} 
        initialSpecies={species} 
        initialLocalized={localized}
        initialEncounters={encounters}
      />
    </>
  );
}
