import axios from 'axios';
import { GRAPHQL_API_BASE } from './client';
import { getCachedData, setCachedData } from './cache';
import { PokemonBasicData } from '@/types/pokemon';

export const getAllPokemonDetailed = async () => {
  const cacheKey = 'all-pokemon-detailed';
  try {
    const query = `
      query {
        pokemon_v2_pokemon(limit: 1500, order_by: {id: asc}) {
          id
          name
          height
          weight
          pokemon_v2_pokemonstats {
            base_stat
          }
          pokemon_v2_pokemonspecy {
            is_legendary
            is_mythical
            generation_id
            pokemon_v2_pokemoncolor {
              name
            }
            pokemon_v2_pokemonshape {
              name
            }
            pokemon_v2_pokemonespeciesegggroups {
              pokemon_v2_egggroup {
                name
              }
            }
            pokemon_v2_pokemonspeciesnames {
              language_id
              name
              pokemon_v2_language {
                name
              }
            }
          }
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
            }
          }
        }
      }
    `;

    const { data } = await axios.post<{ data: { pokemon_v2_pokemon: PokemonBasicData[] } }>(GRAPHQL_API_BASE, { query });
    const results = data.data.pokemon_v2_pokemon;
    await setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    const cached = await getCachedData<PokemonBasicData[]>(cacheKey, true);
    if (cached) return cached;
    throw error;
  }
};

export const getLocalizedPokemonData = async (name: string, languageId: number) => {
  const cacheKey = `localized-pokemon-${name}-${languageId}`;
  try {
    const query = `
      query GetLocalizedPokemon($name: String!, $languageId: Int!) {
        pokemon_v2_pokemonspecies(where: {name: {_eq: $name}}) {
          pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: $languageId}}) {
            name
          }
          pokemon_v2_pokemonspeciesflavortexts(where: {language_id: {_eq: $languageId}}, limit: 5) {
            flavor_text
          }
        }
      }
    `;

    const { data } = await axios.post<{ data: { pokemon_v2_pokemonspecies: unknown[] } }>(GRAPHQL_API_BASE, { 
      query, 
      variables: { name, languageId } 
    });
    
    const results = data.data.pokemon_v2_pokemonspecies[0];
    await setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    const cached = await getCachedData<unknown>(cacheKey, true);
    if (cached) return cached;
    throw error;
  }
};
