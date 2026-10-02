import React from 'react';
import { notFound } from 'next/navigation';
import { getAdminOrderDetailsAction } from '@/app/actions/adminActions';
import { JobCardPrintView } from './JobCardPrintView';

export const revalidate = 0;

export default async function PrintJobCardPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getAdminOrderDetailsAction(orderNumber);

  if (!order) {
    notFound();
  }

  return <JobCardPrintView order={order} />;
}
