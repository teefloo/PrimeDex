'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { TCGCard } from '@/types/tcg';
import { TCGHolographicCard } from './TCGHolographicCard';

interface TCGCardItemProps {
  card: TCGCard;
  index?: number;
  onClick?: (card: TCGCard) => void;
  variant?: 'default' | 'compact' | 'list';
}

export const TCGCardItem = memo(function TCGCardItem({
  card,
  index = 0,
  onClick,
  variant = 'default',
}: TCGCardItemProps) {
  const handleClick = () => {
    if (onClick) onClick(card);
  };

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.25), ease: [0.16, 1, 0.3, 1] }}
        className="block w-full"
      >
        <TCGHolographicCard
          card={card}
          onClick={handleClick}
          className="w-full"
          sizes="(min-width: 1024px) 720px, 92vw"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.02, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="block w-full"
    >
      <TCGHolographicCard
        card={card}
        onClick={handleClick}
        className="w-full"
      />
    </motion.div>
  );
});

export const TCGCardItemSkeleton = () => {
  return <div className="aspect-[2.5/3.5] rounded-[1.25rem] bg-white/[0.03] animate-pulse" />;
};

export type { TCGCardItemProps };
