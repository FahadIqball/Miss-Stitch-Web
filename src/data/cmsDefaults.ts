import { HeroSlide, AnnouncementBarSettings, CategoryCardItem } from '@/types';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: "Festive Luxury '26",
    subtitle: 'Chiffon, Raw Silk & Handcrafted Zardozi',
    description: 'Impeccable embroideries, pure organza borders, and bespoke master tailoring tailored to your exact inch measurements.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85',
    ctaPrimaryText: 'Shop Ready to Wear',
    ctaPrimaryLink: '/shop?category=ready-to-wear',
    ctaSecondaryText: 'Explore Unstitched',
    ctaSecondaryLink: '/shop?category=unstitched',
    tag: 'NEW SEASON DROP',
  },
  {
    id: 2,
    title: 'Micro 9000 Velvet Formals',
    subtitle: 'Antique Dabka & Tissue Dupatta Elegance',
    description: 'Heavily embellished wedding couture with attached pure cotton lining and custom latkan tassels.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85',
    ctaPrimaryText: 'Explore Velvet Formals',
    ctaPrimaryLink: '/shop?category=velvet',
    ctaSecondaryText: 'Custom Silai Atelier',
    ctaSecondaryLink: '/custom-stitching',
    tag: 'WINTER COUTURE',
  },
  {
    id: 3,
    title: 'The Swiss Lawn Luxury Edit',
    subtitle: 'Digital Prints & Schiffli Chickenkari',
    description: 'Breezy summer formals paired with silk dupattas and tailored cigarette pants.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=2000&q=85',
    ctaPrimaryText: 'Shop Lawn 3-Piece',
    ctaPrimaryLink: '/shop?category=unstitched',
    ctaSecondaryText: 'View Size Chart',
    ctaSecondaryLink: '/shop',
    tag: 'SELLING FAST',
  },
];

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarSettings = {
  enabled: true,
  primaryMessage: 'Free Delivery across Pakistan on all orders above Rs. 4,999',
  secondaryMessage: '7–10 Days Master Bespoke Tailoring | Worldwide Express Dispatch',
  promoCode: 'FESTIVE10',
  whatsappNumber: '923000000000',
};

export const DEFAULT_CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: 'cat-unstitched',
    slug: 'unstitched',
    title: 'Unstitched Luxury',
    subtitle: 'Pure Lawn & Chiffon',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-velvet',
    slug: 'velvet',
    title: 'Velvet Formals',
    subtitle: 'Micro 9000 & Dabka',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-pret',
    slug: 'ready-to-wear',
    title: 'Pret Ready-to-Wear',
    subtitle: 'Raw Silk & Chikankari',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-festive',
    slug: 'festive',
    title: 'Festive & Wedding',
    subtitle: 'Zardozi & Organza',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-custom',
    slug: 'custom-stitching',
    title: 'Bespoke Silai',
    subtitle: 'Tailored to Your Inches',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=600&q=80',
  },
];
