import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getCachedData, setCachedData } from './cache';

const tcgClient = axios.create({
  baseURL: 'https://api.tcgdex.net/v2',
  timeout: 10000,
});

axiosRetry(tcgClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  },
});

export interface TCGCard {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  category?: string;
  suffix?: string;
  stage?: string;
  types?: string[];
}

/** TCGdex API client for fetching Pokemon cards */
export const getPokemonCards = async (localizedName: string, lang: string, englishName?: string): Promise<TCGCard[]> => {
  // Map our internal lang codes to TCGdex lang codes if needed (TCGdex supports en, fr, es, it, pt, de)
  const supportedLangs = ['en', 'fr', 'es', 'it', 'pt', 'de'];
  const tcgLang = supportedLangs.includes(lang) ? lang : 'en';

  const cacheKey = `tcg-cards-tcgdex-v2-${tcgLang}-${localizedName}`;
  
  try {
    const cached = await getCachedData<TCGCard[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Fetch directly from the lightweight REST endpoint
    const url = `/${tcgLang}/cards?name=${encodeURIComponent(localizedName)}`;
    
    const { data } = await tcgClient.get<TCGCard[]>(url);
    
    // TCGdex returns all matching cards.
    // To avoid hitting API rate limits with 30+ detail requests per page,
    // we simply filter to only keep cards that have a valid image URL in the base response.
    let enrichedCards = data.filter(card => !!card.image);

    // Fallback to English if no cards found and we aren't already in English
    if (enrichedCards.length === 0 && tcgLang !== 'en' && englishName) {
      const fallbackUrl = `/en/cards?name=${encodeURIComponent(englishName)}`;
      const { data: fallbackData } = await tcgClient.get<TCGCard[]>(fallbackUrl);
      enrichedCards = fallbackData.filter(card => !!card.image);
    }
    
    await setCachedData(cacheKey, enrichedCards);
    return enrichedCards;
  } catch (error) {
    const cached = await getCachedData<TCGCard[]>(cacheKey, true);
    if (cached) return cached;
    
    // Throw error if no cache available
    console.error('[TCG API] Error fetching cards:', error);
    throw error;
  }
};
