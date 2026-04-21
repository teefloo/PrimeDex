import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getCachedData, setCachedData } from './cache';
import type {
  TCGCard,
  TCGCardAbility,
  TCGCardAttack,
  TCGCardCategoryFilter,
  TCGCardFilters,
  TCGCardSortField,
  TCGCardSortOrder,
  TCGCatalogPageResult,
  TCGSet,
  TCGFilterOptions,
} from '@/types/tcg';

const tcgClient = axios.create({
  baseURL: 'https://api.tcgdex.net/v2',
  timeout: 15000,
});

axiosRetry(tcgClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  },
});

const supportedLangs = ['en', 'fr', 'es', 'it', 'pt', 'de', 'ja', 'ko'] as const;
const unsupportedTcgLangs = new Set(['ja', 'ko']);

export const TCG_CARD_CATEGORIES: TCGCardCategoryFilter[] = ['all', 'Pokemon', 'Trainer', 'Energy'];
export const TCG_POKEMON_TYPES = ['Colorless', 'Fire', 'Water', 'Lightning', 'Grass', 'Fighting', 'Psychic', 'Darkness', 'Dragon', 'Fairy', 'Metal'];
export const TCG_TRAINER_TYPES = ['Supporter', 'Item', 'Stadium', 'Tool', 'Ace Spec', 'Technical Machine', 'Goldenrod Game Corner', "Rocket's Secret Machine"];
export const TCG_ENERGY_TYPES = ['Basic', 'Special'];
export const TCG_POKEMON_STAGES = ['Basic', 'Stage1', 'Stage2', 'LevelX', 'V', 'VMAX', 'VSTAR', 'EX', 'GX', 'MEGA'];
export const TCG_GLOBAL_RARITIES = [
  'Common',
  'Uncommon',
  'Rare',
  'Double Rare',
  'Ultra Rare',
  'Illustration Rare',
  'Special Illustration Rare',
  'Hyper Rare',
  'Secret Rare',
  'Promo',
  'Trainer Gallery',
  'Amazing Rare',
  'Radiant Rare',
  'Rare Holo',
  'Rare Holo GX',
  'Rare Holo V',
  'Rare Holo VMAX',
  'Rare Holo VSTAR',
  'Rare Rainbow',
  'Rare Secret',
  'Reverse Holo',
];

export const DEFAULT_TCG_CARD_FILTERS: TCGCardFilters = {
  selectedCategory: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

function resolveTcgLang(lang = 'en') {
  const supportedLang = supportedLangs.includes(lang as (typeof supportedLangs)[number]) ? lang : 'en';
  return unsupportedTcgLangs.has(supportedLang) ? 'en' : supportedLang;
}

function normaliseSet(raw: RawSet): TCGSet {
  const count =
    typeof raw.cardCount?.total === 'number'
      ? raw.cardCount.total
      : typeof raw.totalCards === 'number'
        ? raw.totalCards
        : 0;

  return {
    id: raw.id,
    name: raw.name,
    logo: raw.logo,
    symbol: raw.symbol,
    releaseDate: raw.releaseDate,
    cardCount: raw.cardCount as TCGSet['cardCount'],
    totalCards: count,
    legalities: raw.legalities,
  };
}

function normaliseAttack(attack: TCGCardAttack): TCGCardAttack {
  return {
    ...attack,
    effect: attack.effect ?? attack.text,
    text: attack.text ?? attack.effect,
  };
}

function normaliseAbility(ability: TCGCardAbility): TCGCardAbility {
  return {
    ...ability,
    effect: ability.effect ?? ability.text,
    text: ability.text ?? ability.effect,
  };
}

function normaliseCard(card: TCGCard): TCGCard {
  return {
    ...card,
    source: card.source ?? 'TCGames',
    effect: card.effect ?? card.flavorText ?? card.description,
    description: card.description ?? card.flavorText,
    flavorText: card.flavorText ?? card.description,
    retreat: card.retreat ?? card.retreatCost,
    retreatCost: card.retreatCost ?? card.retreat,
    attacks: card.attacks?.map(normaliseAttack),
    abilities: Array.isArray(card.abilities)
      ? card.abilities.map(normaliseAbility)
      : card.abilities
        ? normaliseAbility(card.abilities)
        : card.abilities,
  };
}

function buildCardQueryParams(filters: TCGCardFilters, page: number, limit: number) {
  const params = new URLSearchParams();
  const searchTerm = filters.searchTerm?.trim();
  const selectedCategory = filters.selectedCategory ?? 'all';
  const selectedSet = filters.selectedSet?.trim();
  const sortBy: TCGCardSortField = filters.sortBy ?? 'name';
  const sortOrder: TCGCardSortOrder = filters.sortOrder ?? 'asc';

  params.set('pagination:page', String(page));
  params.set('pagination:itemsPerPage', String(limit + 1));
  params.set('sort:field', sortBy);
  params.set('sort:order', sortOrder.toUpperCase());

  if (searchTerm) {
    params.set('name', `like:${searchTerm}`);
  }

  if (selectedCategory !== 'all') {
    params.set('category', selectedCategory);
  }

  if (selectedSet) {
    params.set('set.id', `eq:${selectedSet}`);
  }

  if (filters.selectedTypes?.length) {
    params.set('types', filters.selectedTypes.join('|'));
  }

  if (filters.selectedPhase) {
    params.set('stage', `eq:${filters.selectedPhase}`);
  }

  if (filters.selectedTrainerTypes?.length) {
    params.set('trainerType', filters.selectedTrainerTypes.join('|'));
  }

  if (filters.selectedEnergyTypes?.length) {
    params.set('energyType', filters.selectedEnergyTypes.join('|'));
  }

  if (typeof filters.minHp === 'number') {
    params.append('hp', `gte:${filters.minHp}`);
  }

  if (typeof filters.maxHp === 'number') {
    params.append('hp', `lte:${filters.maxHp}`);
  }

  return params;
}

function normalizeFilterValue(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function normalizeRarity(rarity?: string | null) {
  return rarity ? normalizeFilterValue(rarity) : '';
}

function matchesRarityFilter(card: TCGCard, selectedRarity: string): boolean {
  const rarityKey = normalizeRarity(selectedRarity);
  const cardRarity = normalizeRarity(card.rarity);

  if (rarityKey === 'promo') {
    return Boolean(card.variants?.wPromo) || cardRarity.includes('promo');
  }

  if (rarityKey === 'reverseholo') {
    return Boolean(card.variants?.reverse) || cardRarity.includes('reverseholo');
  }

  return cardRarity === rarityKey;
}

function matchesTrainerType(card: TCGCard, selectedTypes: string[]): boolean {
  if (selectedTypes.length === 0) return true;
  const trainerType = normalizeFilterValue(card.trainerType ?? '');
  if (!trainerType) return false;
  return selectedTypes.some((type) => normalizeFilterValue(type) === trainerType);
}

function matchesEnergyType(card: TCGCard, selectedTypes: string[]): boolean {
  if (selectedTypes.length === 0) return true;
  const energyType = normalizeFilterValue(card.energyType ?? '');
  if (!energyType) return false;

  return selectedTypes.some((type) => {
    const normalizedType = normalizeFilterValue(type);
    if (normalizedType === 'basic') {
      return energyType === 'normal';
    }
    return normalizedType === energyType;
  });
}

function cardMatchesLocalFilters(card: TCGCard, filters: TCGCardFilters): boolean {
  if (filters.selectedRarity && !matchesRarityFilter(card, filters.selectedRarity)) {
    return false;
  }

  if (!matchesTrainerType(card, filters.selectedTrainerTypes ?? [])) {
    return false;
  }

  if (!matchesEnergyType(card, filters.selectedEnergyTypes ?? [])) {
    return false;
  }

  return true;
}

function stripLocalOnlyFilters(filters: TCGCardFilters): TCGCardFilters {
  return {
    ...filters,
    selectedRarity: null,
    selectedTrainerTypes: [],
    selectedEnergyTypes: [],
  };
}

function serializeLocalOnlyFilters(filters: TCGCardFilters) {
  const selectedRarity = filters.selectedRarity ?? '';
  const selectedTrainerTypes = [...(filters.selectedTrainerTypes ?? [])].sort().join('|');
  const selectedEnergyTypes = [...(filters.selectedEnergyTypes ?? [])].sort().join('|');

  return [selectedRarity, selectedTrainerTypes, selectedEnergyTypes].join('::');
}

function shouldHydrateForLocalFilters(card: TCGCard, filters: TCGCardFilters): boolean {
  if (filters.selectedRarity && !card.rarity && !card.variants) {
    return true;
  }

  if ((filters.selectedTrainerTypes?.length ?? 0) > 0 && !card.trainerType) {
    return true;
  }

  if ((filters.selectedEnergyTypes?.length ?? 0) > 0 && !card.energyType) {
    return true;
  }

  return false;
}

/**
 * Fetch a single card by ID with full details.
 */
export const getTCGCard = async (cardId: string, lang = 'en'): Promise<TCGCard | null> => {
  const tcgLang = resolveTcgLang(lang);
    const cacheKey = `tcg-card-v4-${cardId}-${tcgLang}`;

  try {
    const cached = await getCachedData<TCGCard>(cacheKey);
    if (cached) return cached;

    const { data } = await tcgClient.get<TCGCard>(`/${tcgLang}/cards/${cardId}`);
    if (data) {
      const card = normaliseCard(data);
      await setCachedData(cacheKey, card);
      return card;
    }

    return null;
  } catch (error) {
    console.error(`[TCG API] Error fetching card ${cardId}:`, error);
    return await getCachedData<TCGCard>(cacheKey, true);
  }
};

/**
 * Fetches all cards from a given set.
 */
export const getCardsBySet = async (setId: string, lang = 'en'): Promise<TCGCard[]> => {
  const tcgLang = resolveTcgLang(lang);
  const cacheKey = `tcg-set-cards-v3-${setId}-${tcgLang}`;

  try {
    const cached = await getCachedData<TCGCard[]>(cacheKey);
    if (cached) return cached;

    const { data } = await tcgClient.get<{ cards: TCGCard[] }>(`/${tcgLang}/sets/${setId}`);
    const cards = data.cards?.filter((card) => card && card.id).map((card) => normaliseCard({ ...card, source: 'TCGames' })) || [];

    await setCachedData(cacheKey, cards);
    return cards;
  } catch (error) {
    console.error(`[TCG API] Error fetching cards for set ${setId}:`, error);
    return (await getCachedData<TCGCard[]>(cacheKey, true)) || [];
  }
};

/**
 * Fetch all available expansion sets.
 */
export const getAllSets = async (lang = 'en'): Promise<TCGSet[]> => {
  const tcgLang = resolveTcgLang(lang);
    const cacheKey = `tcg-all-sets-v4-${tcgLang}`;

  try {
    const cached = await getCachedData<TCGSet[]>(cacheKey);
    if (cached) return cached;

    const { data } = await tcgClient.get<RawSet[]>(`/${tcgLang}/sets`);
    const sets = data.map(normaliseSet).filter((set) => (set.totalCards ?? 0) > 0);

    const enrichedSets = await Promise.all(
      sets.map(async (set) => {
        try {
          const details = await getSetById(set.id, tcgLang);
          return {
            ...set,
            releaseDate: details?.releaseDate ?? set.releaseDate,
          };
        } catch (error) {
          console.warn(`[TCG API] Failed to enrich set ${set.id}:`, error);
          return set;
        }
      }),
    );

    if (tcgLang !== 'en') {
      try {
        const { data: enSets } = await tcgClient.get<RawSet[]>('/en/sets');
        const enSetMap = new Map(enSets.map((set) => [set.id, set]));

        for (const set of enrichedSets) {
          const enSet = enSetMap.get(set.id);
          if (enSet) {
            set.logo = enSet.logo;
            set.symbol = enSet.symbol;
          }
        }
      } catch (error) {
        console.warn('[TCG API] Failed to fetch English set logos:', error);
      }
    }

    const sortedSets = [...enrichedSets].sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : Number.NEGATIVE_INFINITY;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : Number.NEGATIVE_INFINITY;
      return dateB - dateA;
    });

    await setCachedData(cacheKey, sortedSets);
    return sortedSets;
  } catch (error) {
    console.error('[TCG API] Error fetching all sets:', error);
    return (await getCachedData<TCGSet[]>(cacheKey, true)) || [];
  }
};

/**
 * Fetch set details by ID.
 */
export const getSetById = async (setId: string, lang = 'en'): Promise<TCGSet | null> => {
  const tcgLang = resolveTcgLang(lang);
    const cacheKey = `tcg-set-v4-${setId}-${tcgLang}`;

  try {
    const cached = await getCachedData<TCGSet>(cacheKey);
    if (cached) return cached;

    const { data } = await tcgClient.get<RawSet>(`/${tcgLang}/sets/${setId}`);
    const set = normaliseSet(data);
    await setCachedData(cacheKey, set);
    return set;
  } catch (error) {
    console.error(`[TCG API] Error fetching set ${setId}:`, error);
    return await getCachedData<TCGSet>(cacheKey, true);
  }
};

/**
 * Search for cards with filters and pagination.
 */
export const searchCards = async (
  filters: TCGCardFilters,
  lang = 'en',
  page = 1,
  limit = 48,
): Promise<TCGCatalogPageResult> => {
  const tcgLang = resolveTcgLang(lang);
  const queryFilters = stripLocalOnlyFilters(filters);
  const query = buildCardQueryParams(queryFilters, page, limit).toString();
  const cacheKey = `tcg-catalog-v5-${tcgLang}-${query}-p${page}-l${limit}-local-${serializeLocalOnlyFilters(filters)}`;
  const hasLocalOnlyFilters =
    Boolean(filters.selectedRarity) ||
    Boolean(filters.selectedTrainerTypes?.length) ||
    Boolean(filters.selectedEnergyTypes?.length);

  try {
    const cached = await getCachedData<TCGCatalogPageResult>(cacheKey);
    if (cached) return cached;

    if (!hasLocalOnlyFilters) {
      const { data } = await tcgClient.get<TCGCard[]>(`/${tcgLang}/cards?${query}`);
      const pageCards = Array.isArray(data) ? data.slice(0, limit).map((card) => normaliseCard(card)) : [];
      const result = {
        cards: pageCards,
        hasMore: Array.isArray(data) ? data.length > limit : false,
      };

      await setCachedData(cacheKey, result);
      return result;
    }

    const cards: TCGCard[] = [];
    let remotePage = 1;
    let hasMoreRemote = true;
    const targetCount = page * limit + 1;

    while (hasMoreRemote && cards.length < targetCount) {
      const pageQuery = buildCardQueryParams(queryFilters, remotePage, limit).toString();
      const { data } = await tcgClient.get<TCGCard[]>(`/${tcgLang}/cards?${pageQuery}`);
      const normalized = Array.isArray(data) ? data.map((card) => normaliseCard(card)) : [];
      const hydrated = hasLocalOnlyFilters
        ? await Promise.all(
            normalized.map(async (card) => {
              if (!shouldHydrateForLocalFilters(card, filters)) {
                return card;
              }

              const fullCard = await getTCGCard(card.id, tcgLang);
              return fullCard ?? card;
            }),
          )
        : normalized;
      const pageCards = hydrated.filter((card) => cardMatchesLocalFilters(card, filters));
      cards.push(...pageCards);
      hasMoreRemote = Array.isArray(data) ? data.length > limit : false;
      remotePage += 1;
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const result = {
      cards: cards.slice(start, end),
      hasMore: hasMoreRemote || cards.length > end,
    };

    await setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error('[TCG API] Error in searchCards:', error);
    return (await getCachedData<TCGCatalogPageResult>(cacheKey, true)) || { cards: [], hasMore: false };
  }
};

/**
 * Fetch available filter options for the catalog.
 */
export const getFilterOptions = async (lang = 'en'): Promise<TCGFilterOptions> => {
  const tcgLang = resolveTcgLang(lang);
    const cacheKey = `tcg-filter-options-v5-${tcgLang}`;

  try {
    const cached = await getCachedData<TCGFilterOptions>(cacheKey);
    if (cached) return cached;

    const sets = await getAllSets(tcgLang);
    const options: TCGFilterOptions = {
      categories: TCG_CARD_CATEGORIES,
      sets,
      pokemonTypes: TCG_POKEMON_TYPES,
      trainerTypes: TCG_TRAINER_TYPES,
      energyTypes: TCG_ENERGY_TYPES,
      stages: TCG_POKEMON_STAGES,
      rarities: TCG_GLOBAL_RARITIES,
    };

    await setCachedData(cacheKey, options);
    return options;
  } catch (error) {
    console.error('[TCG API] Error fetching filter options:', error);
    return (
      (await getCachedData<TCGFilterOptions>(cacheKey, true)) ?? {
        categories: TCG_CARD_CATEGORIES,
        sets: [],
        pokemonTypes: TCG_POKEMON_TYPES,
        trainerTypes: TCG_TRAINER_TYPES,
        energyTypes: TCG_ENERGY_TYPES,
        stages: TCG_POKEMON_STAGES,
        rarities: TCG_GLOBAL_RARITIES,
      }
    );
  }
};

/**
 * Returns the unique rarities present in a given set, sorted alphabetically.
 * The set listing endpoint omits rarity, so we sample individual card details.
 */
export const getRaritiesForSet = async (setId: string, lang = 'en'): Promise<string[]> => {
  const tcgLang = resolveTcgLang(lang);
    const cacheKey = `tcg-rarities-v4-${setId}-${tcgLang}`;

  try {
    const cached = await getCachedData<string[]>(cacheKey);
    if (cached) return cached;

    const summaries = await getCardsBySet(setId, tcgLang);
    if (summaries.length === 0) return [];

    const total = summaries.length;
    const sampleSize = Math.min(total, 40);
    const step = total / sampleSize;
    const sampledIndices = new Set<number>();
    for (let i = 0; i < sampleSize; i++) {
      sampledIndices.add(Math.min(Math.floor(i * step), total - 1));
    }
    for (let i = Math.max(0, total - 10); i < total; i++) {
      sampledIndices.add(i);
    }

    const sampledIds = [...sampledIndices].map((index) => summaries[index].id);
    const details = await Promise.all(
      sampledIds.map((id) => getTCGCard(id, tcgLang).catch(() => null)),
    );

    const raritySet = new Set<string>();
    for (const card of details) {
      if (card?.rarity) raritySet.add(card.rarity);
    }

    const rarities = [...raritySet].sort((a, b) => a.localeCompare(b));
    await setCachedData(cacheKey, rarities);
    return rarities;
  } catch (error) {
    console.error(`[TCG API] Error fetching rarities for set ${setId}:`, error);
    return (await getCachedData<string[]>(cacheKey, true)) || [];
  }
};

/**
 * Fetch cards by Pokémon name with English fallback and detail enrichment.
 */
export const getPokemonCards = async (
  pokemonName: string,
  lang = 'en',
  englishName?: string,
): Promise<TCGCard[]> => {
  const tcgLang = resolveTcgLang(lang);
  const cacheKey = `tcg-pokemon-cards-v5-${tcgLang}-${pokemonName}`;

  try {
    const cached = await getCachedData<TCGCard[]>(cacheKey);
    if (cached) return cached;

    const { data } = await tcgClient.get<TCGCard[]>(
      `/${tcgLang}/cards?${buildCardQueryParams(
        {
          selectedCategory: 'Pokemon',
          searchTerm: pokemonName,
          sortBy: 'name',
          sortOrder: 'asc',
        },
        1,
        100,
      ).toString()}`,
    );

    let cards = Array.isArray(data) ? data.filter((card) => card.image).map((card) => normaliseCard(card)) : [];

    if (cards.length === 0 && tcgLang !== 'en' && englishName) {
      const { data: fallbackData } = await tcgClient.get<TCGCard[]>(
        `/en/cards?${buildCardQueryParams(
          {
            selectedCategory: 'Pokemon',
            searchTerm: englishName,
            sortBy: 'name',
            sortOrder: 'asc',
          },
          1,
          100,
        ).toString()}`,
      );

      cards = Array.isArray(fallbackData) ? fallbackData.filter((card) => card.image).map((card) => normaliseCard(card)) : [];
    }

    const enriched = await Promise.all(
      cards.map(async (card) => {
        const fullDetails = await getTCGCard(card.id, tcgLang);
        return fullDetails || card;
      }),
    );

    await setCachedData(cacheKey, enriched);
    return enriched;
  } catch (error) {
    console.error(`[TCG API] Error fetching cards for ${pokemonName}:`, error);
    return (await getCachedData<TCGCard[]>(cacheKey, true)) || [];
  }
};

interface RawSet {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  releaseDate?: string;
  cardCount?: { total?: number };
  totalCards?: number;
  legalities?: { unlimited?: string; standard?: string; expanded?: string };
}

export { buildCardQueryParams };
