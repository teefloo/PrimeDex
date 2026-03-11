import axios from 'axios';
import { PokemonDetail, PokemonListResponse, PokemonSpecies } from '@/types/pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';

const api = axios.create({
  baseURL: API_BASE,
});

export const getPokemonList = async ({ pageParam = 0 }: { pageParam?: number }) => {
  const limit = 20;
  const offset = pageParam * limit;
  const { data } = await api.get<PokemonListResponse>(`/pokemon?offset=${offset}&limit=${limit}`);
  
  // On renvoie les résultats et le prochain offset s'il existe
  return { 
    results: data.results, 
    nextParam: data.next ? pageParam + 1 : undefined 
  };
};

export const getAllPokemonNames = async () => {
  // On ne récupère que les noms pour la recherche locale, c'est beaucoup plus léger
  const { data } = await api.get<PokemonListResponse>('/pokemon?limit=2000');
  return data.results;
};

export const getPokemonDetail = async (name: string): Promise<PokemonDetail> => {
  const { data } = await api.get<PokemonDetail>(`/pokemon/${name}`);
  return data;
};

export const getPokemonSpecies = async (name: string): Promise<PokemonSpecies & { evolution_chain: { url: string } }> => {
  try {
    const { data } = await api.get(`/pokemon-species/${name}`);
    return data;
  } catch (error) {
    console.error(`Error fetching species for ${name}:`, error);
    throw error;
  }
};

export const getEvolutionChain = async (url: string) => {
  const { data } = await axios.get(url);
  return data;
};

interface PokemonByTypeResponse {
  pokemon: {
    pokemon: {
      name: string;
      url: string;
    };
    slot: number;
  }[];
}

export const getPokemonByType = async (type: string) => {
  const { data } = await api.get<PokemonByTypeResponse>(`/type/${type}`);
  return data.pokemon.map((p) => p.pokemon);
};

interface GenerationResponse {
  pokemon_species: {
    name: string;
    url: string;
  }[];
}

export const getPokemonByGeneration = async (genId: string) => {
  const { data } = await api.get<GenerationResponse>(`/generation/${genId}`);
  // Pokémon species URL is /pokemon-species/{id}/
  // We need to convert it to /pokemon/{id}/
  return data.pokemon_species.map((species) => ({
    name: species.name,
    url: species.url.replace('pokemon-species', 'pokemon'),
  }));
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
  const { data } = await api.get<TypeRelations>(`/type/${typeName}`);
  return data;
};
