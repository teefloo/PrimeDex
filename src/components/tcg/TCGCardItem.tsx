'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { TCGCard } from '@/types/tcg';
import { useTranslation } from '@/lib/i18n';

interface TCGCardItemProps {
  card: TCGCard;
  index?: number;
  onClick?: (card: TCGCard) => void;
  onHover?: (card: TCGCard) => void;
  variant?: 'default' | 'compact' | 'list';
}

export const TCGCardItem = memo(function TCGCardItem({
  card,
  index = 0,
  onClick,
  onHover,
  variant = 'default',
}: TCGCardItemProps) {
  const { t } = useTranslation();

  const cardImage = useMemo(
    () => (card.image ? `${card.image}/high.webp` : '/images/card-placeholder.webp'),
    [card.image],
  );

  const handleClick = () => {
    if (onClick) onClick(card);
  };

  const handleHover = () => {
    if (onHover) onHover(card);
  };

  if (variant === 'list') {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.25), ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleClick}
        onMouseEnter={handleHover}
        onFocus={handleHover}
        className="block w-full cursor-pointer bg-transparent text-left"
        aria-label={t('tcg.open_card_detail', { name: card.name })}
      >
        <Image
          src={cardImage}
          alt={card.name}
          width={500}
          height={700}
          className="h-auto w-full object-contain object-center"
          unoptimized
        />
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.02, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group block w-full cursor-pointer bg-transparent text-left"
      onClick={handleClick}
      onMouseEnter={handleHover}
      onFocus={handleHover}
      aria-label={t('tcg.open_card_detail', { name: card.name })}
    >
      <Image
        src={cardImage}
        alt={card.name}
        width={500}
        height={700}
        className="h-auto w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.01]"
        unoptimized
      />
    </motion.button>
  );
});

export const TCGCardItemSkeleton = () => {
  return <div className="aspect-[2.5/3.5] rounded-[1.25rem] bg-white/[0.03] animate-pulse" />;
};

export type { TCGCardItemProps };
