import React from 'react';
import { CheckoutClient } from './CheckoutClient';

export const metadata = {
  title: '1-Page Express Checkout | Miss Stitch',
  description: 'Fast, secure checkout with Cash on Delivery (COD), JazzCash, EasyPaisa, and bank transfer across Pakistan.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
