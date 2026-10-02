'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/store/useWishlistStore';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';
import { getLiveCatalogAction } from '@/app/actions/catalogActions';
import { ProductCard } from '@/components/product/ProductCard';
import { Heart, Sparkles, ArrowRight, Trash2 } from 'lucide-react';

export const WishlistClient: React.FC = () => {
  const { wishlistIds, clearWishlist } = useWishlistStore();
  const [catalog, setCatalog] = React.useState<Product[]>(PRODUCTS);

  React.useEffect(() => {
    getLiveCatalogAction().then((items) => {
      if (items && items.length > 0) setCatalog(items);
    });
  }, []);

  const wishlistProducts = catalog.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#66666E] mb-6">
          <Link href="/" className="hover:text-[#E61A6B]">Home</Link>
          <span>/</span>
          <span className="text-[#1F1F24] font-semibold">My Wishlist</span>
        </nav>

        <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#E5E2DC]">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1F24]">
              My Saved Wishlist ({wishlistProducts.length})
            </h1>
            <p className="text-xs sm:text-sm text-[#66666E] mt-1">
              Your favorite festive lawn, chiffon, and velvet suits ready for Silai configuration.
            </p>
          </div>

          {wishlistProducts.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs text-[#66666E] hover:text-[#E61A6B] font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 bg-[#FAF5E6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#E61A6B]">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1F1F24] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-[#66666E] mb-6">
              Tap the heart icon on any suit card to save it for later review.
            </p>
            <Link
              href="/shop"
              className="btn-rani px-8 py-3 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <span>Explore Collection Drops</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
