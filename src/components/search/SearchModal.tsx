'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUIStore } from '@/store/useUIStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';
import { getLiveCatalogAction } from '@/app/actions/catalogActions';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchModalOpen, closeSearchModal } = useUIStore();
  const { formatPrice } = useCurrencyStore();
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<Product[]>(PRODUCTS);

  // Fetch live database catalog when search opens
  useEffect(() => {
    if (isSearchModalOpen) {
      getLiveCatalogAction().then((items) => {
        if (items && items.length > 0) setCatalog(items);
      });
    }
  }, [isSearchModalOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        useUIStore.getState().openSearchModal();
      }
      if (e.key === 'Escape') {
        useUIStore.getState().closeSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = query.trim()
    ? catalog.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.collection.toLowerCase().includes(query.toLowerCase()) ||
          p.fabric.toLowerCase().includes(query.toLowerCase()) ||
          p.colorName.toLowerCase().includes(query.toLowerCase())
      )
    : catalog.slice(0, 4);

  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeSearchModal}
      />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24 text-center">
        <div className="w-full max-w-2xl bg-[#FAF8F5] rounded-xl shadow-2xl border border-[#D4AF37]/50 p-6 text-left relative z-10 animate-in zoom-in-95 duration-200">
          {/* Search Header Input */}
          <div className="relative flex items-center mb-6">
            <Search className="w-5 h-5 text-[#66666E] absolute left-3.5" />
            <input
              type="text"
              autoFocus
              placeholder="Search lawn, chiffon, velvet, unstitched 3-pc..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-[#E5E2DC] rounded-lg py-3.5 pl-11 pr-10 text-sm sm:text-base text-[#1F1F24] focus:outline-none focus:border-[#E61A6B] shadow-inner font-medium"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 text-[#66666E] hover:text-[#1F1F24]"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={closeSearchModal}
                className="absolute right-3 p-1 text-[#66666E] hover:text-[#1F1F24]"
                aria-label="Close search modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
            <span className="text-[#66666E] font-semibold">Trending:</span>
            {['Festive Lawn', 'Velvet Formals', 'Raw Silk Pret', 'Chiffon 3-Pc', 'Custom Stitching'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="px-2.5 py-1 bg-white border border-[#E5E2DC] rounded text-[#1F1F24] hover:border-[#D4AF37] whitespace-nowrap"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-[#66666E] font-bold uppercase tracking-wider pb-1 border-b border-[#E5E2DC]">
              <span>{query ? `Search Results (${filtered.length})` : 'Popular Drops'}</span>
              <span>Price (PKR)</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#66666E]">
                No suits found matching &ldquo;{query}&rdquo;. Try searching for &ldquo;Lawn&rdquo;, &ldquo;Chiffon&rdquo;, or &ldquo;Velvet&rdquo;.
              </div>
            ) : (
              filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={closeSearchModal}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E5E2DC] hover:border-[#E61A6B] hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 relative rounded bg-[#FAF8F5] overflow-hidden shrink-0 border border-[#E5E2DC]">
                      <Image
                        src={product.images.primary}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#66666E]">
                        {product.collection}
                      </span>
                      <h4 className="text-xs font-bold text-[#1F1F24] group-hover:text-[#E61A6B] transition-colors">
                        {product.title}
                      </h4>
                      <p className="text-[10px] text-[#66666E] flex items-center gap-1 mt-0.5">
                        <span className="font-semibold text-[#0A5C36]">{product.fabric}</span>
                        <span>•</span>
                        <span>{product.pieceCount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#1F1F24] block">
                      {formatPrice(product.basePricePKR)}
                    </span>
                    <span className="text-[10px] text-[#0A5C36] font-semibold flex items-center gap-1 justify-end">
                      <Sparkles className="w-3 h-3" />
                      <span>Silai Available</span>
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5E2DC] text-center">
            <Link
              href="/shop"
              onClick={closeSearchModal}
              className="text-xs text-[#E61A6B] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Explore All Catalog Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
