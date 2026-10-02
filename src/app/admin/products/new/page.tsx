import React from 'react';
import { NewProductClient } from './NewProductClient';

export const metadata = {
  title: 'Add New Luxury Suit | Miss Stitch Atelier Catalog Studio',
  description: 'Upload suit imagery, configure fabric specifications, and set bespoke silai fees.',
};

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
  return <NewProductClient />;
}
