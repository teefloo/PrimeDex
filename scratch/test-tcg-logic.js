/* eslint-disable @typescript-eslint/no-require-imports */
const axios = require('axios');

const tcgCatalogClient = axios.create({
  baseURL: 'https://api.tcgdex.net/v2',
  timeout: 15000,
});

const DEFAULT_SET_ID = 'sv01';

async function getCardsBySet(setId, lang = 'en') {
  try {
    const { data } = await tcgCatalogClient.get(`/${lang}/sets/${setId}`);
    const cards = data.cards?.filter((c) => c && c.id) || [];
    return cards;
  } catch (error) {
    console.error(`Error fetching cards for set ${setId}:`, error.message);
    return [];
  }
}

async function searchCards(filters, lang = 'en', page = 1, limit = 50) {
  const setId = filters.selectedSet || DEFAULT_SET_ID;
  const allCards = await getCardsBySet(setId, lang);
  console.log(`Fetched ${allCards.length} cards for set ${setId}`);

  let filtered = allCards;
  // Apply logic similar to tcg-catalog.ts...
  const total = filtered.length;
  const start = (page - 1) * limit;
  const cards = filtered.slice(start, start + limit);
  const hasMore = start + limit < total;

  return { cards: cards.length, total, hasMore };
}

async function test() {
  const result = await searchCards({});
  console.log('Result:', JSON.stringify(result, null, 2));
}

test();
