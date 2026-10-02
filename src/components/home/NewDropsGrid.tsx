'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

const TABS = [
  { label: 'All New In', category: 'all' },
  { label: 'Festive Luxury', category: 'festive' },
  { label: 'Velvet Formals', category: 'velvet' },
  { label: 'Unstitched Lawn', category: 'unstitched' },
  { label: 'Ready to Wear Pret', category: 'ready-to-wear' },
];

interface NewDropsGridProps {
  initialProducts?: Product[];
}

export const NewDropsGrid: React.FC<NewDropsGridProps> = ({ initialProducts }) => {
  const catalog = (initialProducts && initialProducts.length > 0) ? initialProducts : PRODUCTS;
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts =
    activeTab === 'all'
      ? catalog
      : catalog.filter((p) => p.category === activeTab);

  return (
    <section className="py-16 bg-white border-b border-[#E5E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#E61A6B] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Seasonal Releases</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1F24]">
              New In Collection Drops
            </h2>
            <p className="text-xs sm:text-sm text-[#66666E] mt-1">
              Hover over cards for dual-view previews & instant stitched price calculations.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.category}
                type="button"
                onClick={() => setActiveTab(tab.category)}
                className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.category
                    ? 'bg-[#1F1F24] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#66666E] border border-[#E5E2DC] hover:border-[#D4AF37] hover:text-[#1F1F24]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="btn-gold-outline px-8 py-3 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-xs hover:border-[#E61A6B]"
          >
            <span>Explore All {catalog.length}+ Designer Suits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
