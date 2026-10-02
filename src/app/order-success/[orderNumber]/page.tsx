import React from 'react';
import { OrderSuccessClient } from './OrderSuccessClient';

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export const metadata = {
  title: 'Order Confirmed | Miss Stitch',
  description: 'Your bespoke tailoring order has been received and confirmed.',
};

export default async function OrderSuccessPage({ params }: Props) {
  const { orderNumber } = await params;
  return <OrderSuccessClient orderNumber={orderNumber} />;
}
