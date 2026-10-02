import React from 'react';
import { getAdminProductsAction } from '@/app/actions/adminActions';
import { ProductsClient } from './ProductsClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await getAdminProductsAction();
  return <ProductsClient initialProducts={products} />;
}
