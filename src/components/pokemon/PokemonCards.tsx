'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { getPokemonCards } from '@/lib/api';
import { TCGCard } from '@/lib/api/tcg';
import { pokemonKeys } from '@/lib/api/keys';
import { Loader2, X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { PokemonCard3D } from './PokemonCard3D';

interface PokemonCardsProps {
  name: string;
  localizedName?: string;
  lang?: string;
}

// rarity and category are now provided by TCGCard directly from TCGdex detail API

export const PokemonCards: React.FC<PokemonCardsProps> = ({ name, localizedName, lang }) => {
  const { t } = useTranslation();
  const queryName = localizedName || name;
  const tcgLang = lang || 'en';
  
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);

  const { data: cards, isLoading, error } = useQuery({
    queryKey: [...pokemonKeys.tcg.cards(name), tcgLang, queryName],
    queryFn: () => getPokemonCards(queryName, tcgLang, name),
    enabled: !!queryName,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48, // Keep in garbage collection for 48 hours
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
      </div>
    );
  }

  if (error || !cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px] glass-panel rounded-[2.5rem]">
        <p className="text-foreground/50 font-bold uppercase tracking-widest text-sm mb-2">
          {t('detail.no_cards_found', { defaultValue: 'No cards found' })}
        </p>
        <p className="text-xs text-foreground/40">
          {t('detail.no_cards_desc', { defaultValue: 'There might not be any cards available for this Pokémon yet.' })}
        </p>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="glass-panel p-6 md:p-8 rounded-[2.5rem]">
      <h3 className="text-2xl font-black mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
        <span className="text-foreground/90">{t('detail.cards')}</span>
        <span className="px-2 py-1 bg-secondary/50 rounded-md text-xs font-bold text-foreground/60">
          {cards.length}
        </span>
      </h3>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
      >
        <div className="hidden">
          {/* eslint-disable @next/next/no-css-tags */}
          {/* Preload required styles via React 19 <link> hoisting feature */}
          <link rel="stylesheet" href="/pokemon-cards/css/cards/base.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/basic.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/reverse-holo.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/regular-holo.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/cosmos-holo.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/amazing-rare.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/radiant-holo.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/v-regular.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/v-full-art.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/v-max.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/v-star.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/trainer-full-art.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/rainbow-holo.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/rainbow-alt.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/secret-rare.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/trainer-gallery-holo.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/trainer-gallery-v-regular.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/trainer-gallery-v-max.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/trainer-gallery-secret-rare.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/shiny-rare.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/shiny-v.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/shiny-vmax.css" precedence="default" />
          <link rel="stylesheet" href="/pokemon-cards/css/cards/swsh-pikachu.css" precedence="default" />
        </div>
        {cards.map((card) => (
          <motion.div key={card.id} variants={itemVariants} className="group relative z-10 perspective-1000 w-full flex items-center justify-center">
            <PokemonCard3D
              name={card.name}
              image={`${card.image}/high.webp`}
              number={card.localId}
              set={card.id.split('-')[0]}
              rarity={card.rarity}
              supertype={card.category || 'pokémon'}
              suffix={card.suffix}
              stage={card.stage}
              types={card.types}
              className="w-[100%] max-w-[280px]"
              onClick={() => setSelectedCard(card)}
            />
            
            <div className="absolute -bottom-2 -left-2 -right-2 bg-background/80 backdrop-blur-md rounded-xl p-3 border border-white/10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-[60] shadow-xl pointer-events-none">
              <p className="text-xs font-black truncate text-foreground/90">{card.name}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] md:text-[10px] font-bold text-foreground/60 truncate uppercase tracking-widest">#{card.localId} ({card.id.split('-')[0].toUpperCase()})</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {selectedCard && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col items-center"
            >
              <button
                onClick={() => setSelectedCard(null)}
                aria-label={t('detail.close_card', { defaultValue: 'Close card' })}
                className="fixed top-4 right-4 md:top-8 md:right-8 p-3 text-white/70 hover:text-white bg-black/60 hover:bg-black/90 rounded-full backdrop-blur-md transition-all z-[10000] hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
              
              <PokemonCard3D
                name={selectedCard.name}
                image={`${selectedCard.image}/high.webp`}
                number={selectedCard.localId}
                set={selectedCard.id.split('-')[0]}
                rarity={selectedCard.rarity}
                supertype={selectedCard.category || 'pokémon'}
                suffix={selectedCard.suffix}
                stage={selectedCard.stage}
                types={selectedCard.types}
                className="w-auto h-auto max-h-[65vh] md:max-h-[75vh] max-w-[85vw] card--no-frame"
                active={true}
              />
              
              <div className="mt-4 text-center">
                <h4 className="text-xl md:text-2xl font-black text-white">{selectedCard.name}</h4>
                <p className="text-sm md:text-base text-white/60 font-medium uppercase tracking-widest mt-1">
                  #{selectedCard.localId} • {selectedCard.id.split('-')[0].toUpperCase()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
