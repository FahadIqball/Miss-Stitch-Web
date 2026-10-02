import React from 'react';
import { getAdminOrdersAction } from '@/app/actions/adminActions';
import { OrdersListClient } from './OrdersListClient';

export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const initialOrders = await getAdminOrdersAction(params.status || 'all');

  return <OrdersListClient initialOrders={initialOrders} />;
}
