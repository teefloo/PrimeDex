import apiClient from './client';
import { getCachedData, setCachedData } from './cache';
import { PokemonDetail, PokemonListResponse, PokemonSpecies } from '@/types/pokemon';

export const getPokemonList = async ({ pageParam = 0 }) => {
  const cacheKey = `pokemon-list-${pageParam}`;
  const cached = await getCachedData<PokemonListResponse & { nextParam?: number }>(cacheKey);
  if (cached) return cached;

  const { data } = await apiClient.get<PokemonListResponse>(`/pokemon?offset=${pageParam}&limit=20`);
  
  // Extract offset from next URL if it exists
  let nextParam: number | undefined;
  if (data.next) {
    const url = new URL(data.next);
    nextParam = parseInt(url.searchParams.get('offset') || '0');
  }

  const result = { ...data, nextParam };
  await setCachedData(cacheKey, result);
  return result;
};

export const getPokemonDetail = async (name: string): Promise<PokemonDetail> => {
  const cacheKey = `pokemon-detail-${name}`;
  const cached = await getCachedData<PokemonDetail>(cacheKey);
  if (cached) return cached;

  const { data } = await apiClient.get<PokemonDetail>(`/pokemon/${name}`);
  await setCachedData(cacheKey, data);
  return data;
};

export const getPokemonSpecies = async (name: string): Promise<PokemonSpecies> => {
  const cacheKey = `pokemon-species-${name}`;
  const cached = await getCachedData<PokemonSpecies>(cacheKey);
  if (cached) return cached;

  const { data } = await apiClient.get<PokemonSpecies>(`/pokemon-species/${name}`);
  await setCachedData(cacheKey, data);
  return data;
};

export const getAllPokemonNames = async (): Promise<{ name: string; url: string }[]> => {
  const cacheKey = 'all-pokemon-names';
  const cached = await getCachedData<{ name: string; url: string }[]>(cacheKey);
  if (cached) return cached;

  const { data } = await apiClient.get<{ results: { name: string; url: string }[] }>('/pokemon?limit=1025');
  await setCachedData(cacheKey, data.results);
  return data.results;
};

export const getPokemonByGeneration = async (id: string): Promise<{ name: string; url: string }[]> => {
  const cacheKey = `generation-${id}`;
  const cached = await getCachedData<{ name: string; url: string }[]>(cacheKey);
  if (cached) return cached;

  const { data } = await apiClient.get<{ pokemon_species: { name: string; url: string }[] }>(`/generation/${id}`);
  const results = data.pokemon_species.map(p => ({
    name: p.name,
    url: p.url.replace('-species', '')
  }));
  await setCachedData(cacheKey, results);
  return results;
};

export const getPokemonByType = async (type: string): Promise<{ name: string; url: string }[]> => {
  const cacheKey = `type-${type}`;
  const cached = await getCachedData<{ name: string; url: string }[]>(cacheKey);
  if (cached) return cached;

  const { data } = await apiClient.get<{ pokemon: { pokemon: { name: string; url: string } }[] }>(`/type/${type}`);
  const results = data.pokemon.map(p => p.pokemon);
  await setCachedData(cacheKey, results);
  return results;
};

export interface TypeRelations {
  damage_relations: {
    double_damage_from: { name: string }[];
    double_damage_to: { name: string }[];
    half_damage_from: { name: string }[];
    half_damage_to: { name: string }[];
    no_damage_from: { name: string }[];
    no_damage_to: { name: string }[];
  };
}

export const getTypeRelations = async (typeName: string): Promise<TypeRelations> => {
  const cacheKey = `type-relations-${typeName}`;
  const cached = await getCachedData<TypeRelations>(cacheKey);
  if (cached) return cached;

  const { data } = await apiClient.get<TypeRelations>(`/type/${typeName}`);
  await setCachedData(cacheKey, data);
  return data;
};

export interface MoveDetail {
  name: string;
  power: number | null;
  accuracy: number | null;
  type: { name: string };
  damage_class: { name: string };
}

export const getMoveDetail = async (name: string): Promise<MoveDetail> => {
  const cacheKey = `move-detail-${name}`;
  const cached = await getCachedData<MoveDetail>(cacheKey);
  if (cached) return cached;

  const { data } = await apiClient.get<MoveDetail>(`/move/${name}`);
  await setCachedData(cacheKey, data);
  return data;
};
