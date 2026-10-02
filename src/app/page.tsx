import React from 'react';
import { HeroSlider } from '@/components/home/HeroSlider';
import { CategoryRail } from '@/components/home/CategoryRail';
import { NewDropsGrid } from '@/components/home/NewDropsGrid';
import { HowSilaiWorks } from '@/components/home/HowSilaiWorks';
import { AtelierBanner } from '@/components/home/AtelierBanner';
import { SocialProofReviews } from '@/components/home/SocialProofReviews';
import { getSiteContentAction } from '@/app/actions/cmsActions';
import { getLiveCatalogAction } from '@/app/actions/catalogActions';
import { DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS } from '@/data/cmsDefaults';
import { HeroSlide, CategoryCardItem, Product } from '@/types';

export const revalidate = 60; // Instantaneous on revalidatePath('/') or 60s background ISR

export default async function HomePage() {
  const [heroSlides, categoryCards, liveProducts] = await Promise.all([
    getSiteContentAction<HeroSlide[]>('hero_slides', DEFAULT_HERO_SLIDES),
    getSiteContentAction<CategoryCardItem[]>('category_cards', DEFAULT_CATEGORY_CARDS),
    getLiveCatalogAction(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Full-Width Festive Hero Slider */}
      <HeroSlider initialSlides={heroSlides} />

      {/* 2. Visual Story / Category Rail */}
      <CategoryRail initialCategories={categoryCards} />

      {/* 3. New In Drops Grid with Instant Dual Price Toggle */}
      <NewDropsGrid initialProducts={liveProducts} />

      {/* 4. "How Miss Stitch Tailoring Works" 3-Step Explainer */}
      <HowSilaiWorks />

      {/* 5. Bespoke Atelier Craft & Finishing Spotlight */}
      <AtelierBanner />

      {/* 6. Social Proof & Verified Pakistani Customer Reviews */}
      <SocialProofReviews />
    </div>
  );
}
