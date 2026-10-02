'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { Heart, Eye, Sparkles, Scissors, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice } = useCurrencyStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { openQuickViewModal } = useUIStore();

  const [isHovered, setIsHovered] = useState(false);
  const [priceMode, setPriceMode] = useState<'unstitched' | 'stitched'>('unstitched');

  const inWishlist = isInWishlist(product.id);
  const stitchedPrice = product.basePricePKR + product.standardStitchingFeePKR;
  const currentDisplayedPrice = priceMode === 'unstitched' ? product.basePricePKR : stitchedPrice;

  return (
    <div
      className="group bg-white border border-[#E5E2DC] rounded-lg overflow-hidden shadow-xs hover:shadow-md hover:border-[#D4AF37] transition-all duration-300 flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Hover Switch */}
      <div className="relative aspect-[3/4] bg-[#FAF8F5] overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block relative w-full h-full">
          {/* Primary Image */}
          <Image
            src={product.images.primary}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-500 ${
              isHovered && product.images.secondary ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {/* Secondary Image (Hover View) */}
          {product.images.secondary && (
            <Image
              src={product.images.secondary}
              alt={`${product.title} Alternate View`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-500 absolute inset-0 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </Link>

        {/* Top Badges & Status Tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {!product.inStock && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-xs bg-[#9E182B] text-white">
              Sold Out
            </span>
          )}
          {product.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-xs ${
                tag === 'Ready to Ship'
                  ? 'bg-[#0A5C36] text-white'
                  : tag === 'Hand Embroidered'
                  ? 'bg-[#1F1F24] text-[#D4AF37] border border-[#D4AF37]/50'
                  : 'bg-[#E61A6B] text-white'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full z-10 transition-all duration-200 ${
            inWishlist
              ? 'bg-[#E61A6B] text-white shadow-md'
              : 'bg-white/90 text-[#1F1F24] hover:text-[#E61A6B] shadow-xs'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button (Slide up on hover) */}
        <div className="absolute bottom-2 inset-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuickViewModal(product.slug, product);
            }}
            className="w-full py-2 bg-[#1F1F24]/95 text-white hover:bg-[#E61A6B] text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View & Silai</span>
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Collection & Fabric Composition Badge */}
          <div className="flex items-center justify-between text-[10px] text-[#66666E] font-semibold mb-1">
            <span className="uppercase tracking-wider truncate max-w-[120px]">
              {product.collection}
            </span>
            <span className="px-1.5 py-0.2 bg-[#FAF8F5] border border-[#E5E2DC] rounded text-[#0A5C36] font-bold">
              {product.fabric} • {product.pieceCount}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#1F1F24] group-hover:text-[#E61A6B] transition-colors line-clamp-1 mb-2">
            <Link href={`/product/${product.slug}`}>{product.title}</Link>
          </h3>
        </div>

        <div>
          {/* Instant Price Toggle (Unstitched vs Stitched) */}
          <div className="bg-[#FAF8F5] border border-[#E5E2DC] rounded p-1 flex items-center justify-between text-[11px] mb-2.5">
            <button
              type="button"
              onClick={() => setPriceMode('unstitched')}
              className={`flex-1 py-0.5 rounded text-center font-semibold transition-colors ${
                priceMode === 'unstitched'
                  ? 'bg-white text-[#1F1F24] shadow-xs border border-[#E5E2DC]'
                  : 'text-[#66666E] hover:text-[#1F1F24]'
              }`}
            >
              Unstitched
            </button>
            <button
              type="button"
              onClick={() => setPriceMode('stitched')}
              className={`flex-1 py-0.5 rounded text-center font-semibold transition-colors flex items-center justify-center gap-1 ${
                priceMode === 'stitched'
                  ? 'bg-[#FAF5E6] text-[#1F1F24] shadow-xs border border-[#D4AF37]'
                  : 'text-[#66666E] hover:text-[#1F1F24]'
              }`}
            >
              <Scissors className="w-2.5 h-2.5 text-[#E61A6B]" />
              <span>Stitched</span>
            </button>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-sm sm:text-base font-bold text-[#1F1F24]">
              {formatPrice(currentDisplayedPrice)}
            </span>
            <span className="text-[10px] text-[#66666E]">
              {priceMode === 'unstitched' ? 'Base Fabric' : 'Fabric + Master Stitch'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
