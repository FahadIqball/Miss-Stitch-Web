import React from 'react';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { ProductDetailClient } from './ProductDetailClient';
import { getStorefrontStockMapAction } from '@/app/actions/adminActions';
import { getLiveProductBySlugAction } from '@/app/actions/catalogActions';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getLiveProductBySlugAction(slug);
  if (!product) return { title: 'Product Not Found | Miss Stitch' };

  const description =
    product.fabricDescription ||
    `Shop ${product.title} in genuine ${product.fabric} with bespoke master tailoring silai options.`;

  return {
    title: `${product.title} — Unstitched & Custom Silai | Miss Stitch`,
    description,
    openGraph: {
      title: `${product.title} | Miss Stitch Atelier`,
      description,
      images: [
        {
          url: product.images.primary,
          width: 800,
          height: 1067,
          alt: product.title,
        },
      ],
      type: 'website',
      siteName: 'Miss Stitch',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Miss Stitch Atelier`,
      description,
      images: [product.images.primary],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getLiveProductBySlugAction(slug);

  if (!product) {
    notFound();
  }

  const stockMap = await getStorefrontStockMapAction();
  const liveInStock = stockMap[product.slug] ?? stockMap[product.id] ?? product.inStock;

  return <ProductDetailClient product={{ ...product, inStock: liveInStock }} />;
}
