export interface HeldItem {
  id: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  iconUrl: string;
}

const ITEMS: Record<string, HeldItem> = {
  leftovers: {
    id: 'leftovers',
    name: { en: 'Leftovers', fr: 'Restes' },
    description: {
      en: 'Gradually restores HP during battle. Essential for bulky Pokémon and tanks to increase longevity.',
      fr: 'Restaure progressivement des PV au combat. Essentiel pour les Pokémon défensifs pour augmenter leur longévité.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leftovers.png'
  },
  life_orb: {
    id: 'life-orb',
    name: { en: 'Life Orb', fr: 'Orbe Vie' },
    description: {
      en: 'Boosts power of attacks by 30% but costs HP on each hit. Maximizes damage output for sweepers.',
      fr: 'Booste la puissance des attaques de 30% mais coûte des PV. Maximise les dégâts pour les sweepers.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png'
  },
  choice_band: {
    id: 'choice-band',
    name: { en: 'Choice Band', fr: 'Bandeau Choix' },
    description: {
      en: 'Boosts Attack by 50%, but locks into one move. Allows physical attackers to break through walls.',
      fr: 'Améliore l\'Attaque de 50%, mais bloque sur une seule capacité. Permet de briser les murs physiques.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png'
  },
  choice_specs: {
    id: 'choice-specs',
    name: { en: 'Choice Specs', fr: 'Lunettes Choix' },
    description: {
      en: 'Boosts Sp. Atk by 50%, but locks into one move. Devastating on special attackers.',
      fr: 'Améliore l\'Attaque Spéciale de 50%, mais bloque sur une seule capacité. Dévastateur sur les attaquants spéciaux.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-specs.png'
  },
  choice_scarf: {
    id: 'choice-scarf',
    name: { en: 'Choice Scarf', fr: 'Mouchoir Choix' },
    description: {
      en: 'Boosts Speed by 50%, but locks into one move. Perfect for revenge killing and outspeeding threats.',
      fr: 'Améliore la Vitesse de 50%, mais bloque sur une seule capacité. Parfait pour le revenge kill.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png'
  },
  focus_sash: {
    id: 'focus-sash',
    name: { en: 'Focus Sash', fr: 'Ceinture Force' },
    description: {
      en: 'Survives any one-hit KO with 1 HP when at full health. Crucial for frail sweepers and leads.',
      fr: 'Survit à un coup KO avec 1 PV si les PV sont au max. Crucial pour les sweepers fragiles.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-sash.png'
  },
  assault_vest: {
    id: 'assault-vest',
    name: { en: 'Assault Vest', fr: 'Veste de Combat' },
    description: {
      en: 'Boosts Sp. Def by 50% but prevents status moves. Turns bulky attackers into special tanks.',
      fr: 'Booste la Défense Spéciale de 50% mais empêche les capacités de statut. Transforme les attaquants en tanks.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/assault-vest.png'
  },
  heavy_duty_boots: {
    id: 'heavy-duty-boots',
    name: { en: 'Heavy-Duty Boots', fr: 'Grosses Bottes' },
    description: {
      en: 'Protects from entry hazards like Stealth Rock. Vital for Pokémon weak to Rock or frequent switchers.',
      fr: 'Protège des entry hazards comme Piège de Roc. Vital pour les Pokémon vulnérables aux rocs.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heavy-duty-boots.png'
  },
  rocky_helmet: {
    id: 'rocky-helmet',
    name: { en: 'Rocky Helmet', fr: 'Casque Brut' },
    description: {
      en: 'Deals 1/6 HP damage to attackers on contact. Punishes physical attackers hitting into your wall.',
      fr: 'Inflige 1/6 des PV à l\'attaquant en cas de contact. Punit les attaquants physiques.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png'
  },
  black_sludge: {
    id: 'black-sludge',
    name: { en: 'Black Sludge', fr: 'Boue Noire' },
    description: {
      en: 'Restores HP for Poison-types. Better than Leftovers as it damages non-Poison Pokémon that steal it.',
      fr: 'Restaure des PV pour les types Poison. Mieux que les Restes car blesse les voleurs d\'objets.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/black-sludge.png'
  },
  eviolite: {
    id: 'eviolite',
    name: { en: 'Eviolite', fr: 'Évoluroc' },
    description: {
      en: 'Boosts Def and Sp. Def by 50% for unevolved Pokémon. Makes many NFE Pokémon extremely bulky.',
      fr: 'Booste Défense et Déf. Spé. de 50% pour les Pokémon non-évolués. Rend les NFE extrêmement résistants.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/eviolite.png'
  },
  flame_orb: {
    id: 'flame-orb',
    name: { en: 'Flame Orb', fr: 'Orbe Flamme' },
    description: {
      en: 'Burns the holder to activate Guts (+50% Atk) or other burn-related abilities.',
      fr: 'Brûle le porteur pour activer Cran (+50% Atk) ou d\'autres talents liés à la brûlure.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-orb.png'
  },
  toxic_orb: {
    id: 'toxic-orb',
    name: { en: 'Toxic Orb', fr: 'Orbe Toxique' },
    description: {
      en: 'Badly poisons the holder to activate Poison Heal (restores 1/8 HP/turn) or Guts.',
      fr: 'Empoisonne gravement le porteur pour activer Soin Poison (restaure 1/8 PV/tour) ou Cran.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/toxic-orb.png'
  },
  weakness_policy: {
    id: 'weakness-policy',
    name: { en: 'Weakness Policy', fr: 'Politique Assaut' },
    description: {
      en: 'Boosts Atk and Sp. Atk by +2 when hit by a super-effective move. Perfect for bulky setup sweepers.',
      fr: 'Booste Atk et Atk. Spé. de +2 quand touché par un coup super efficace. Idéal pour les sweepers résistants.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/weakness-policy.png'
  },
  sitrus_berry: {
    id: 'sitrus-berry',
    name: { en: 'Sitrus Berry', fr: 'Baie Sitrus' },
    description: {
      en: 'Restores 25% HP when health drops below 50%. Provides a reliable one-time burst of healing.',
      fr: 'Restaure 25% des PV quand la santé descend sous 50%. Fournit un soin ponctuel fiable.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png'
  },
  lum_berry: {
    id: 'lum-berry',
    name: { en: 'Lum Berry', fr: 'Baie Prine' },
    description: {
      en: 'Cures any status condition once. Protects sweepers from paralysis, burn, or sleep while they set up.',
      fr: 'Guérit n\'importe quel statut une fois. Protège les sweepers des altérations de statut.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lum-berry.png'
  },
  air_balloon: {
    id: 'air-balloon',
    name: { en: 'Air Balloon', fr: 'Ballon' },
    description: {
      en: 'Makes the holder immune to Ground-type moves until hit. Crucial for Pokémon with 4x Ground weakness.',
      fr: 'Immunise contre les capacités Sol jusqu\'à ce que le porteur soit touché. Crucial pour les Pokémon vulnérables au Sol.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/air-balloon.png'
  },
  expert_belt: {
    id: 'expert-belt',
    name: { en: 'Expert Belt', fr: 'Ceinture Pro' },
    description: {
      en: 'Boosts power of super-effective moves by 20%. Great for versatile attackers with wide coverage.',
      fr: 'Booste la puissance des coups super efficaces de 20%. Idéal pour les attaquants polyvalents.'
    },
    iconUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/expert-belt.png'
  },
};

// Well-known Pokémon that can't evolve further but are NFE in game data
const NOTABLE_NFE_POKEMON = [
  'chansey', 'porygon2', 'dusclops', 'scyther', 'rhydon', 'slowpoke',
  'pikachu', 'clefairy', 'magnemite', 'magneton', 'onix', 'haunter',
  'kadabra', 'machoke', 'graveler', 'boldore', 'doublade', 'murkrow',
  'sneasel', 'gligar', 'togetic', 'roselia', 'vigoroth', 'lairon',
  'shelgon', 'metang', 'zweilous', 'lampent', 'charjabug', 'cosmoem',
  'carkol', 'drakloak', 'type-null',
];

// Pokémon known for Guts/Flare Boost abilities
const GUTS_POKEMON = [
  'conkeldurr', 'heracross', 'machamp', 'hariyama', 'swellow', 'ursaring',
  'obstagoon', 'luxray', 'flareon', 'timburr', 'gurdurr', 'throh',
  'raticate', 'taillow', 'makuhita', 'tyrogue', 'shinx', 'luxio',
];

// Pokémon known for Poison Heal ability
const POISON_HEAL_POKEMON = [
  'gliscor', 'breloom', 'shroomish',
];

export const getRecommendedItems = (pokemon: any): HeldItem[] => {
  if (!pokemon || !pokemon.stats) return [];

  const getStat = (name: string) => pokemon.stats.find((s: any) => s.stat?.name === name || s.name === name)?.base_stat || 0;
  
  const hp = getStat('hp');
  const atk = getStat('attack');
  const def = getStat('defense');
  const spa = getStat('special-attack');
  const spd = getStat('special-defense');
  const spe = getStat('speed');
  const totalStats = hp + atk + def + spa + spd + spe;

  const types = pokemon.types.map((t: any) => t.type?.name || t.name || t);
  const pokemonName = (pokemon.name || '').toLowerCase();
  
  const isPoison = types.includes('poison');
  const isFlying = types.includes('flying');
  const isFire = types.includes('fire');
  const isBug = types.includes('bug');
  const isIce = types.includes('ice');
  const isSteel = types.includes('steel');
  const isRock = types.includes('rock');
  const isElectric = types.includes('electric');

  const recommended: HeldItem[] = [];

  // --- Special ability-based items (highest priority) ---

  if (GUTS_POKEMON.includes(pokemonName)) {
    recommended.push(ITEMS.flame_orb);
  }

  if (POISON_HEAL_POKEMON.includes(pokemonName)) {
    recommended.push(ITEMS.toxic_orb);
  }

  if (NOTABLE_NFE_POKEMON.includes(pokemonName) && (def >= 60 || spd >= 60)) {
    recommended.push(ITEMS.eviolite);
  }

  // --- Type-based protection ---

  // Stealth Rock Weakness -> Heavy-Duty Boots
  if ((isFlying || isFire || isBug || isIce) && !isSteel && (hp < 100 || spe > 90)) {
    recommended.push(ITEMS.heavy_duty_boots);
  }

  // 4x Ground weakness -> Air Balloon
  if ((isSteel && isElectric) || (isSteel && isRock) || (isFire && isRock)) {
    recommended.push(ITEMS.air_balloon);
  }

  // --- Defensive items ---

  if (hp >= 90 && def + spd >= 170) {
    if (isPoison) {
      recommended.push(ITEMS.black_sludge);
    } else {
      recommended.push(ITEMS.leftovers);
    }
    
    if (def >= 110) {
      recommended.push(ITEMS.rocky_helmet);
    }
  }

  // --- Offensive items ---

  if (hp >= 80 && (def >= 80 || spd >= 80) && (atk >= 100 || spa >= 100) && spe <= 100) {
    recommended.push(ITEMS.weakness_policy);
  }

  if (spe >= 100 && hp <= 80 && def <= 80 && spd <= 80) {
    recommended.push(ITEMS.focus_sash);
  }

  if (atk >= 110 && atk > spa + 20) {
    recommended.push(ITEMS.choice_band);
  } else if (spa >= 110 && spa > atk + 20) {
    recommended.push(ITEMS.choice_specs);
  }

  if (spe >= 80 && spe <= 105 && (atk >= 100 || spa >= 100)) {
    recommended.push(ITEMS.choice_scarf);
  }

  if (Math.abs(atk - spa) < 20 && atk > 80 && spa > 80) {
    recommended.push(ITEMS.expert_belt);
  }

  if (hp >= 80 && (atk >= 100 || spa >= 100) && spd >= 70 && spd <= 110) {
    recommended.push(ITEMS.assault_vest);
  }

  // --- Fallbacks ---

  if (recommended.length < 2) {
    if (totalStats < 400) {
      recommended.push(ITEMS.sitrus_berry);
    } else if (atk > spa || spa > atk) {
      recommended.push(ITEMS.life_orb);
    } else {
      recommended.push(ITEMS.leftovers);
    }
  }

  // Return top 3 unique items
  return Array.from(new Set(recommended)).filter(Boolean).slice(0, 3);
};
