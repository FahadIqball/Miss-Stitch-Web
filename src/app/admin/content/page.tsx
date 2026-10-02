import React from 'react';
import { getSiteContentAction } from '@/app/actions/cmsActions';
import { DEFAULT_HERO_SLIDES, DEFAULT_ANNOUNCEMENT_BAR, DEFAULT_CATEGORY_CARDS } from '@/data/cmsDefaults';
import { HeroSlide, AnnouncementBarSettings, CategoryCardItem } from '@/types';
import { ContentClient } from './ContentClient';

export const metadata = {
  title: 'Visual CMS & Marketing Engine | Miss Stitch Atelier Portal',
  description: 'Manage homepage hero slides, circular category highlights, and top promotional announcement ticker.',
};

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const [initialSlides, initialAnnouncement, initialCategories] = await Promise.all([
    getSiteContentAction<HeroSlide[]>('hero_slides', DEFAULT_HERO_SLIDES),
    getSiteContentAction<AnnouncementBarSettings>('announcement_bar', DEFAULT_ANNOUNCEMENT_BAR),
    getSiteContentAction<CategoryCardItem[]>('category_cards', DEFAULT_CATEGORY_CARDS),
  ]);

  return (
    <ContentClient
      initialSlides={initialSlides}
      initialAnnouncement={initialAnnouncement}
      initialCategories={initialCategories}
    />
  );
}
