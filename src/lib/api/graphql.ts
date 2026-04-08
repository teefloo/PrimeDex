import { graphqlClient } from './client';
import { getCachedData, setCachedData } from './cache';
import { PokemonBasicData, GraphQLPokemonSummary, GraphQLPokemonMoveData, LocalizedPokemonData, GraphQLMoveData, GraphQLMovePokemonData } from '@/types/pokemon';

const BATCH_SIZE = 200;
const TOTAL_POKEMON = 1500;

const getBatchCacheKey = (base: string, batchIndex: number) => `${base}-batch-${batchIndex}`;

const fetchBatch = async <T>(query: string, cacheKey: string): Promise<T[]> => {
  const cached = await getCachedData<T[]>(cacheKey, true);
  if (cached) return cached;

  const { data } = await graphqlClient.post<{ data?: { pokemon_v2_pokemon?: T[] } }>('/graphql/v1beta', { query });
  
  if (!data?.data?.pokemon_v2_pokemon) {
    throw new Error(`Invalid GraphQL response in fetchBatch: ${JSON.stringify(data)}`);
  }
  
  const results = data.data.pokemon_v2_pokemon;
  await setCachedData(cacheKey, results);
  return results;
};

export const getAllPokemonSummary = async (): Promise<GraphQLPokemonSummary[]> => {
  const cacheKey = 'all-pokemon-summary-v1';
  
  const cached = await getCachedData<GraphQLPokemonSummary[]>(cacheKey, true);
  if (cached) return cached;

  try {
    const query = `
      query {
        pokemon_v2_pokemon(limit: 1500, order_by: {id: asc}) {
          id
          name
          height
          weight
          pokemon_v2_pokemonspecy {
            generation_id
            pokemon_v2_pokemonspeciesnames(where: {pokemon_v2_language: {name: {_in: ["en", "fr", "es", "de", "it", "ja", "ko"]}}}) {
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

    const { data } = await graphqlClient.post<{ data?: { pokemon_v2_pokemon?: GraphQLPokemonSummary[] } }>('/graphql/v1beta', { query });
    if (!data?.data?.pokemon_v2_pokemon) {
      throw new Error(`Invalid GraphQL response in getAllPokemonSummary: ${JSON.stringify(data)}`);
    }
    const results = data.data.pokemon_v2_pokemon;
    await setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    throw error;
  }
};

export const getAllPokemonSummaryPaginated = async (): Promise<GraphQLPokemonSummary[][]> => {
  const batches: Promise<GraphQLPokemonSummary[]>[] = [];
  
  for (let i = 0; i < TOTAL_POKEMON; i += BATCH_SIZE) {
    const cacheKey = getBatchCacheKey('all-pokemon-summary-paginated-v1', Math.floor(i / BATCH_SIZE));
    const query = `
      query {
        pokemon_v2_pokemon(limit: ${BATCH_SIZE}, offset: ${i}, order_by: {id: asc}) {
          id
          name
          height
          weight
          pokemon_v2_pokemonspecy {
            generation_id
            pokemon_v2_pokemonspeciesnames(where: {pokemon_v2_language: {name: {_in: ["en", "fr", "es", "de", "it", "ja", "ko"]}}}) {
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
    batches.push(fetchBatch<GraphQLPokemonSummary>(query, cacheKey));
  }

  return Promise.all(batches);
};

export const getAllPokemonDetailed = async (): Promise<PokemonBasicData[]> => {
  const cacheKey = 'all-pokemon-detailed-v8';
  
  const cached = await getCachedData<PokemonBasicData[]>(cacheKey, true);
  if (cached && cached.length > 0 && cached[0]?.pokemon_v2_pokemonspecy) {
    return cached;
  }

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
            pokemon_v2_pokemonegggroups {
              pokemon_v2_egggroup {
                name
              }
            }
            pokemon_v2_pokemonspeciesnames(where: {pokemon_v2_language: {name: {_in: ["en", "fr", "es", "de", "it", "ja", "ko"]}}}) {
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

    const response = await graphqlClient.post<{ data?: { pokemon_v2_pokemon?: PokemonBasicData[] } }>('/graphql/v1beta', { query });
    
    if (!response.data?.data?.pokemon_v2_pokemon || !Array.isArray(response.data.data.pokemon_v2_pokemon)) {
      console.warn('Invalid GraphQL response, trying paginated fallback...');
      const paginatedResults = await getAllPokemonDetailedPaginated();
      const flattenedResults = paginatedResults.flat();
      if (flattenedResults.length > 0) {
        await setCachedData(cacheKey, flattenedResults);
        return flattenedResults;
      }
      throw new Error('PokéAPI GraphQL returned invalid data');
    }
    
    const results = response.data.data.pokemon_v2_pokemon;
    await setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Failed to fetch detailed Pokémon data:', error);
    const paginatedResults = await getAllPokemonDetailedPaginated();
    const flattenedResults = paginatedResults.flat();
    if (flattenedResults.length > 0) {
      return flattenedResults;
    }
    throw error;
  }
};

export const getAllPokemonDetailedPaginated = async (): Promise<PokemonBasicData[][]> => {
  const batches: Promise<PokemonBasicData[]>[] = [];
  
  for (let i = 0; i < TOTAL_POKEMON; i += BATCH_SIZE) {
    const cacheKey = getBatchCacheKey('all-pokemon-detailed-paginated-v1', Math.floor(i / BATCH_SIZE));
    const query = `
      query {
        pokemon_v2_pokemon(limit: ${BATCH_SIZE}, offset: ${i}, order_by: {id: asc}) {
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
            pokemon_v2_pokemonegggroups {
              pokemon_v2_egggroup {
                name
              }
            }
            pokemon_v2_pokemonspeciesnames(where: {pokemon_v2_language: {name: {_in: ["en", "fr", "es", "de", "it", "ja", "ko"]}}}) {
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
    batches.push(fetchBatch<PokemonBasicData>(query, cacheKey));
  }

  return Promise.all(batches);
};

export const getLocalizedPokemonData = async (name: string, languageId: number): Promise<LocalizedPokemonData> => {
  const cacheKey = `localized-pokemon-${name}-${languageId}`;
  try {
    const query = `
      query GetLocalizedPokemon($name: String!, $languageId: Int!) {
        pokemon_v2_pokemonspecies(where: {name: {_eq: $name}}) {
          pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: $languageId}}) {
            name
            pokemon_v2_language {
              name
            }
          }
          pokemon_v2_pokemonspeciesflavortexts(where: {language_id: {_eq: $languageId}}, limit: 5) {
            flavor_text
            pokemon_v2_language {
              name
            }
          }
        }
      }
    `;

    const { data } = await graphqlClient.post<{ data?: { pokemon_v2_pokemonspecies?: LocalizedPokemonData[] } }>('/graphql/v1beta', { 
      query, 
      variables: { name, languageId } 
    });
    
    if (!data?.data?.pokemon_v2_pokemonspecies?.[0]) {
      throw new Error(`Invalid GraphQL response in getLocalizedPokemonData: ${JSON.stringify(data)}`);
    }
    
    const results = data.data.pokemon_v2_pokemonspecies[0];
    await setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    const cached = await getCachedData<LocalizedPokemonData>(cacheKey, true);
    if (cached) return cached;
    throw error;
  }
};

export const getPokemonMovesLocalized = async (name: string, languageId: number): Promise<GraphQLPokemonMoveData[]> => {
  const cacheKey = `localized-moves-${name}-${languageId}`;
  try {
    const query = `
      query GetPokemonMoves($name: String!, $languageId: Int!) {
        pokemon_v2_pokemon(where: {name: {_eq: $name}}) {
          pokemon_v2_pokemonmoves(distinct_on: move_id, order_by: {move_id: asc}) {
            pokemon_v2_move {
              name
              power
              accuracy
              pokemon_v2_type {
                name
              }
              pokemon_v2_movedamageclass {
                name
              }
              pokemon_v2_movenames(where: {language_id: {_eq: $languageId}}) {
                name
              }
              pokemon_v2_moveflavortexts(where: {language_id: {_eq: $languageId}}, limit: 1) {
                flavor_text
              }
            }
          }
        }
      }
    `;

    const { data } = await graphqlClient.post<{ data: { pokemon_v2_pokemon: Array<{ pokemon_v2_pokemonmoves: GraphQLPokemonMoveData[] }> } }>('/graphql/v1beta', { 
      query, 
      variables: { name, languageId } 
    });
    
    let result: GraphQLPokemonMoveData[] = [];
    if (data?.data?.pokemon_v2_pokemon?.[0]) {
      result = data.data.pokemon_v2_pokemon[0].pokemon_v2_pokemonmoves;
    }
    await setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    const cached = await getCachedData<GraphQLPokemonMoveData[]>(cacheKey, true);
    if (cached) return cached;
    throw error;
  }
};

export const getAllMoves = async (languageId: number): Promise<GraphQLMoveData[]> => {
  const cacheKey = `all-moves-${languageId}`;
  const cached = await getCachedData<GraphQLMoveData[]>(cacheKey, true);
  if (cached) return cached;

  try {
    const query = `
      query GetAllMoves($languageId: Int!) {
        pokemon_v2_move(limit: 1000, order_by: {id: asc}) {
          id
          name
          power
          accuracy
          pp
          priority
          generation_id
          pokemon_v2_type {
            name
          }
          pokemon_v2_movedamageclass {
            name
          }
          pokemon_v2_movenames(where: {language_id: {_eq: $languageId}}) {
            name
          }
          pokemon_v2_moveflavortexts(where: {language_id: {_eq: $languageId}}, limit: 1) {
            flavor_text
          }
          pokemon_v2_moveeffect {
            pokemon_v2_moveeffecteffecttexts(where: {language_id: {_eq: $languageId}}) {
              short_effect
              effect
            }
          }
        }
      }
    `;

    const { data } = await graphqlClient.post<{ data?: { pokemon_v2_move?: GraphQLMoveData[] } }>('/graphql/v1beta', {
      query,
      variables: { languageId },
    });

    if (!data?.data?.pokemon_v2_move) {
      throw new Error(`Invalid GraphQL response in getAllMoves: ${JSON.stringify(data)}`);
    }

    const results = data.data.pokemon_v2_move;
    await setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    const cached = await getCachedData<GraphQLMoveData[]>(cacheKey, true);
    if (cached) return cached;
    throw error;
  }
};

export const getMovePokemonLearners = async (moveName: string, languageId: number): Promise<GraphQLMovePokemonData[]> => {
  const cacheKey = `move-learners-v2-${moveName}-${languageId}`;
  const cached = await getCachedData<GraphQLMovePokemonData[]>(cacheKey, true);
  if (cached) return cached;

  try {
    const query = `
      query GetMoveLearners($moveName: String!, $languageId: Int!) {
        pokemon_v2_pokemonmove(
          where: {pokemon_v2_move: {name: {_eq: $moveName}}}
          order_by: {pokemon_id: asc}
        ) {
          level
          pokemon_v2_movelearnmethod {
            name
          }
          pokemon_v2_pokemon {
            id
            name
            pokemon_v2_pokemontypes {
              pokemon_v2_type {
                name
              }
            }
            pokemon_v2_pokemonspecy {
              pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: $languageId}}) {
                name
              }
            }
          }
        }
      }
    `;

    const { data } = await graphqlClient.post<{ data?: { pokemon_v2_pokemonmove?: GraphQLMovePokemonData[] } }>('/graphql/v1beta', {
      query,
      variables: { moveName, languageId },
    });

    if (!data?.data?.pokemon_v2_pokemonmove) {
      throw new Error(`Invalid GraphQL response in getMovePokemonLearners: ${JSON.stringify(data)}`);
    }

    const results = data.data.pokemon_v2_pokemonmove;
    await setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    const cached = await getCachedData<GraphQLMovePokemonData[]>(cacheKey, true);
    if (cached) return cached;
    throw error;
  }
};
