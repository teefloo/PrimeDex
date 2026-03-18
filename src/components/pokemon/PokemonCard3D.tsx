'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PokemonCard3DProps {
  name: string;
  image: string;
  rarity?: string;
  supertype?: string;
  subtypes?: string;
  types?: string | string[];
  suffix?: string;
  stage?: string;
  number?: string;
  set?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

// Math helpers from pokemon-cards-css
const round = (val: number, prec = 3) => parseFloat(val.toFixed(prec));
const clamp = (val: number, min = 0, max = 100) => Math.min(Math.max(val, min), max);
const adjust = (val: number, fromMin: number, fromMax: number, toMin: number, toMax: number) => {
  return round(toMin + (toMax - toMin) * (val - fromMin) / (fromMax - fromMin));
};

export const PokemonCard3D: React.FC<PokemonCard3DProps> = ({
  name,
  image,
  rarity = 'common',
  supertype = 'pokémon',
  subtypes = 'basic',
  types = '',
  suffix = '',
  stage = '',
  number = '',
  set = '',
  className,
  onClick,
  active = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [interacting, setInteracting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation state tracking identical to svelte's custom spring implementation
  const target = useRef({
    rx: 0, ry: 0,
    gx: 50, gy: 50, go: 0,
    bx: 50, by: 50,
  });
  
  const current = useRef({
    rx: 0, ry: 0,
    gx: 50, gy: 50, go: 0,
    bx: 50, by: 50,
  });

  const rafId = useRef<number | null>(null);

  const updateStyles = useCallback(function updateStyles() {
    if (!cardRef.current) return;
    
    // Smooth dampening logic
    const lerp = (start: number, end: number, factor: number = 0.15) => start + (end - start) * factor;
    
    current.current.rx = lerp(current.current.rx, target.current.rx);
    current.current.ry = lerp(current.current.ry, target.current.ry);
    current.current.gx = lerp(current.current.gx, target.current.gx);
    current.current.gy = lerp(current.current.gy, target.current.gy);
    current.current.go = lerp(current.current.go, target.current.go);
    current.current.bx = lerp(current.current.bx, target.current.bx);
    current.current.by = lerp(current.current.by, target.current.by);

    const { rx, ry, gx, gy, go, bx, by } = current.current;
    
    const ptrFromCenter = clamp( Math.sqrt( (gy - 50) * (gy - 50) + (gx - 50) * (gx - 50) ) / 50, 0, 1);

    cardRef.current.style.setProperty('--rotate-x', `${rx}deg`);
    cardRef.current.style.setProperty('--rotate-y', `${ry}deg`);
    cardRef.current.style.setProperty('--pointer-x', `${gx}%`);
    cardRef.current.style.setProperty('--pointer-y', `${gy}%`);
    cardRef.current.style.setProperty('--card-opacity', `${go}`);
    cardRef.current.style.setProperty('--background-x', `${bx}%`);
    cardRef.current.style.setProperty('--background-y', `${by}%`);
    cardRef.current.style.setProperty('--pointer-from-center', `${ptrFromCenter}`);
    cardRef.current.style.setProperty('--pointer-from-top', `${gy / 100}`);
    cardRef.current.style.setProperty('--pointer-from-left', `${gx / 100}`);

    const isMoving = 
      Math.abs(target.current.rx - current.current.rx) > 0.05 ||
      Math.abs(target.current.ry - current.current.ry) > 0.05 ||
      Math.abs(target.current.gx - current.current.gx) > 0.05 ||
      Math.abs(target.current.gy - current.current.gy) > 0.05 ||
      Math.abs(target.current.go - current.current.go) > 0.01;

    if (isMoving) {
      rafId.current = requestAnimationFrame(updateStyles);
    } else {
      rafId.current = null;
    }
  }, []);

  const setTarget = useCallback((newTarget: Partial<typeof target.current>) => {
    target.current = { ...target.current, ...newTarget };
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(updateStyles);
    }
  }, [updateStyles]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setInteracting(true);
    if (!cardRef.current) return;
    
    const clientX = e.clientX;
    const clientY = e.clientY;

    const rect = cardRef.current.getBoundingClientRect();
    const absolute = { x: clientX - rect.left, y: clientY - rect.top };
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    };
    const center = { x: percent.x - 50, y: percent.y - 50 };
    
    setTarget({
      bx: adjust(percent.x, 0, 100, 37, 63),
      by: adjust(percent.y, 0, 100, 33, 67),
      rx: round(-(center.x / 3.5)),
      ry: round(center.y / 3.5),
      gx: round(percent.x),
      gy: round(percent.y),
      go: 1,
    });
  }, [setTarget]);

  const handlePointerLeave = useCallback(() => {
    setInteracting(false);
    setTarget({
      bx: 50, by: 50,
      rx: 0, ry: 0,
      gx: 50, gy: 50, go: 0
    });
  }, [setTarget]);

  // Handle mobile touch effectively
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent scrolling while interacting
    const touch = e.touches[0];
    handlePointerMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as React.PointerEvent<HTMLDivElement>);
  }, [handlePointerMove]);

  // Seed for cosmos/background
  const [seeds, setSeeds] = useState({ seedx: 0, seedy: 0, cx: 0, cy: 0 });
  useEffect(() => {
    setSeeds({
      seedx: Math.random(),
      seedy: Math.random(),
      cx: Math.floor(Math.random() * 734),
      cy: Math.floor(Math.random() * 1280),
    });
  }, []);

  const staticStyles = {
    '--seedx': seeds.seedx,
    '--seedy': seeds.seedy,
    '--cosmosbg': `${seeds.cx}px ${seeds.cy}px`,
    '--pointer-x': `${current.current.gx}%`,
    '--pointer-y': `${current.current.gy}%`,
    '--pointer-from-center': `${clamp( Math.sqrt( (current.current.gy - 50) ** 2 + (current.current.gx - 50) ** 2 ) / 50, 0, 1)}`,
    '--pointer-from-top': `${current.current.gy / 100}`,
    '--pointer-from-left': `${current.current.gx / 100}`,
    '--card-opacity': `${current.current.go}`,
    '--rotate-x': `${current.current.rx}deg`,
    '--rotate-y': `${current.current.ry}deg`,
    '--background-x': `${current.current.bx}%`,
    '--background-y': `${current.current.by}%`,
  } as React.CSSProperties & Record<string, string | number>;

  const isTrainerGallery = !!number.match(/^[tg]g/i);

  // Derive subtypes for CSS data-subtypes
  let derivedSubtypes = (subtypes || "").toLowerCase();
  if (suffix) {
    const s = suffix.toLowerCase();
    if (s === "v" || s === "vmax" || s === "vstar" || s === "ex") {
      derivedSubtypes += ` ${s}`;
    }
  }
  if (stage) {
    derivedSubtypes += ` ${stage.toLowerCase()}`;
  }
  if (rarity?.toLowerCase().includes("radiant")) {
    derivedSubtypes += " radiant";
  }
  
  const mappedSubtypes = derivedSubtypes.trim().replace(/,/g, " ");

  // Comprehensive Rarity Mapping to CSS data-rarity
  let mappedRarity = (rarity || "common").toLowerCase();
  const supertypeLower = supertype.toLowerCase();

  // 1. Shiny Variants
  if (mappedRarity.includes("shiny rare v") || mappedRarity === "shiny ultra rare") {
    mappedRarity = "rare shiny v";
  } else if (mappedRarity.includes("shiny rare vmax")) {
    mappedRarity = "rare shiny vmax";
  } else if (mappedRarity.includes("shiny")) {
    mappedRarity = "rare shiny";
  } 
  // 2. V / VMAX / VSTAR Variants
  else if (mappedRarity === "holo rare v" || suffix?.toLowerCase() === "v") {
    // Check if it's a full art V
    if (mappedRarity.includes("ultra") || mappedRarity.includes("illustration")) {
      mappedRarity = "rare ultra";
    } else {
      mappedRarity = "rare holo v";
    }
  } else if (mappedRarity === "holo rare vmax" || suffix?.toLowerCase() === "vmax") {
    mappedRarity = "rare holo vmax";
  } else if (mappedRarity === "holo rare vstar" || suffix?.toLowerCase() === "vstar") {
    mappedRarity = "rare holo vstar";
  }
  // 3. Secret / Hyper / Rainbow
  else if (mappedRarity === "hyper rare" || mappedRarity.includes("rainbow") || mappedRarity === "crown") {
    mappedRarity = "rare rainbow";
  } else if (mappedRarity === "secret rare") {
    mappedRarity = "rare secret";
  }
  // 4. Ultra / Full Art / Illustration
  else if (
    mappedRarity === "ultra rare" || 
    mappedRarity === "double rare" || 
    mappedRarity.includes("illustration rare")
  ) {
    mappedRarity = "rare ultra";
  }
  // 5. Amazing Rare
  else if (mappedRarity === "amazing rare") {
    mappedRarity = "amazing rare";
  }
  // 5b. Radiant Rare
  else if (mappedRarity === "radiant rare" || mappedRarity.includes("radiant")) {
    mappedRarity = "radiant rare";
  }
  // 6. Full Art Trainer (from TCGdex "Full Art Trainer" rarity)
  else if (mappedRarity === "full art trainer") {
    mappedRarity = "rare ultra"; // trainer-full-art.css targets .card[data-rarity="rare ultra"][data-supertype="trainer"]
  }
  // 7. Standard Holos
  else if (mappedRarity.includes("holo") || mappedRarity === "rare") {
    mappedRarity = "rare holo";
  }
  // 8. Common / Uncommon
  else if (mappedRarity === "common" || mappedRarity === "uncommon" || mappedRarity === "none") {
    mappedRarity = "common";
  } else {
    mappedRarity = "rare holo"; // Fallback
  }

  let mappedSupertype = supertypeLower;
  if (mappedSupertype === "pokemon") {
    mappedSupertype = "pokémon";
  }

  const mappedTypes = Array.isArray(types) ? types.join(' ').toLowerCase() : (types || '').toLowerCase();

  return (
    <div
      ref={cardRef}
      className={cn(
        'card interactive',
        mappedTypes,
        active && 'active',
        interacting && 'interacting',
        loading && 'loading',
        className
      )}
      data-number={number}
      data-set={set}
      data-subtypes={mappedSubtypes}
      data-supertype={mappedSupertype}
      data-rarity={mappedRarity}
      data-trainer-gallery={isTrainerGallery}
      style={staticStyles}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onTouchMove={handleTouchMove}
      onTouchStart={(e) => handleTouchMove(e)}
      onTouchEnd={handlePointerLeave}
    >
      <div className="card__translater">
        <button
          className="card__rotator !appearance-none !focus:outline-none"
          onClick={onClick}
          aria-label={`View full details for ${name}`}
          tabIndex={0}
        >
          <Image
            className="card__back"
            src="https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg"
            alt="Card Back"
            width={660}
            height={921}
            loading="lazy"
          />
          <div className="card__front">
            <Image
              src={image}
              alt={name}
              width={660}
              height={921}
              loading="lazy"
              onLoad={() => setLoading(false)}
            />
            <div className="card__shine"></div>
            <div className="card__glare"></div>
          </div>
        </button>
      </div>
      
      {/* 
        This is a Next.js trick: We can inject the main cards.css 
        and global logic styles globally at the bottom if not already applied,
        but typically we link them properly in the parent. 
      */}
    </div>
  );
};
