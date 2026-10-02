'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Scissors, ArrowRight } from 'lucide-react';
import { CategoryCardItem } from '@/types';
import { DEFAULT_CATEGORY_CARDS } from '@/data/cmsDefaults';

interface CategoryRailProps {
  initialCategories?: CategoryCardItem[];
}

export const CategoryRail: React.FC<CategoryRailProps> = ({ initialCategories }) => {
  const categories = (initialCategories && initialCategories.length > 0)
    ? initialCategories
    : DEFAULT_CATEGORY_CARDS;

  return (
    <section className="py-12 sm:py-16 bg-[#FAF8F5] border-b border-[#E5E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E5E2DC]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#E61A6B] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Collections</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24]">
              Explore By Category & Craft
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider font-bold text-[#1F1F24] hover:text-[#E61A6B] flex items-center gap-1 mt-2 sm:mt-0 transition-colors"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Circular Visual Rail */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.slug === 'custom-stitching' ? '/custom-stitching' : `/shop?category=${cat.slug}`}
              className="group flex flex-col items-center text-center select-none"
            >
              {/* Circular Image Container with Golden Border on Hover */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 border-2 border-[#D4AF37]/50 group-hover:border-[#E61A6B] transition-all duration-300 bg-white shadow-xs group-hover:scale-105 group-hover:shadow-md">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="150px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FAF8F5]" />
                  )}
                </div>
                {cat.slug === 'custom-stitching' && (
                  <div className="absolute -bottom-1 inset-x-0 flex justify-center">
                    <span className="bg-[#1F1F24] text-[#D4AF37] border border-[#D4AF37] text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Scissors className="w-2.5 h-2.5" />
                      <span>Silai</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Count */}
              <h3 className="font-serif text-sm sm:text-base font-bold text-[#1F1F24] group-hover:text-[#E61A6B] mt-3 transition-colors">
                {cat.title}
              </h3>
              <span className="text-[11px] text-[#66666E] font-medium">
                {cat.subtitle || 'Luxury Collection'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
