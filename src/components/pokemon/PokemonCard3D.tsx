'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

interface PokemonCard3DProps {
  name: string;
  image: string;
  className?: string;
  onClick?: () => void;
}

export const PokemonCard3D: React.FC<PokemonCard3DProps> = ({
  name,
  image,
  className,
  onClick,
}) => {
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={cn(
        'glass-card group relative overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]',
        loading && 'loading',
        className,
      )}
      onClick={onClick}
      aria-label={t('tcg.open_card_detail', { name })}
    >
      <div className="relative aspect-[2.5/3.5] w-full">
        <Image
          src={image}
          alt={name}
          fill
          className={cn('object-contain transition-transform duration-500 group-hover:scale-[1.04]', loading && 'opacity-0')}
          onLoad={() => setLoading(false)}
        />
      </div>
    </button>
  );
};
