export const pokemonKeys = {
  all: ['pokemon'] as const,
  lists: () => [...pokemonKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...pokemonKeys.lists(), { filters }] as const,
  details: () => [...pokemonKeys.all, 'detail'] as const,
  detail: (name: string) => [...pokemonKeys.details(), name] as const,
  species: (name: string) => [...pokemonKeys.all, 'species', name] as const,
  types: () => [...pokemonKeys.all, 'type'] as const,
  type: (type: string) => [...pokemonKeys.types(), type] as const,
  encounters: (id: number) => [...pokemonKeys.all, 'encounters', id] as const,
  names: () => [...pokemonKeys.all, 'names'] as const,
  allDetailed: () => [...pokemonKeys.all, 'all-detailed'] as const,
  localized: (name: string, langId: number) => [...pokemonKeys.all, 'localized', name, langId] as const,
};
