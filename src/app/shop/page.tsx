import React, { Suspense } from 'react';
import { ShopClient } from './ShopClient';
import { getLiveCatalogAction } from '@/app/actions/catalogActions';

export const metadata = {
  title: 'Luxury Collections & Unstitched Lawn | Miss Stitch',
  description:
    'Browse our curated catalogue of Pakistani luxury lawn, chiffon 3-piece, velvet formals, and ready-to-wear pret with optional master bespoke tailoring.',
};

export const revalidate = 60;

export default async function ShopPage() {
  const initialProducts = await getLiveCatalogAction();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-[#E61A6B] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-sm font-bold text-[#1F1F24]">Loading Miss Stitch Catalog...</p>
          </div>
        </div>
      }
    >
      <ShopClient initialProducts={initialProducts} />
    </Suspense>
  );
}
