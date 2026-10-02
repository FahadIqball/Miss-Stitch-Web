export interface CustomerReview {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number;
  date: string;
  suitName: string;
  stitchingType: 'Custom Made-to-Measure' | 'Standard Stitched (Medium)' | 'Standard Stitched (Large)' | 'Unstitched Fabric';
  comment: string;
  verifiedBuyer: boolean;
  avatarImage: string;
}

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Mahnoor Tariq',
    city: 'Lahore (DHA Phase 5)',
    country: 'Pakistan',
    rating: 5,
    date: '3 days ago',
    suitName: 'Gul-e-Noor Embroidered Chiffon 3-Pc',
    stitchingType: 'Custom Made-to-Measure',
    comment: 'SubhanAllah the fitting is 100% tailor perfect! I submitted my chest and shoulder measurements online with the cigarette pants cut, and the shameez cotton lining was already neatly attached. Received in Lahore in 6 days.',
    verifiedBuyer: true,
    avatarImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'rev-2',
    name: 'Dr. Fatima Rizvi',
    city: 'Karachi (Clifton)',
    country: 'Pakistan',
    rating: 5,
    date: '1 week ago',
    suitName: 'Mehtab Emerald Handcrafted Velvet Formal',
    stitchingType: 'Custom Made-to-Measure',
    comment: 'The zardozi work and the weight of the Micro 9000 velvet is breathtaking. Latkan tassels on the tissue dupatta look like luxury bridal couture. Truly the best stitching service in Pakistan.',
    verifiedBuyer: true,
    avatarImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'rev-3',
    name: 'Samina Afzal',
    city: 'London',
    country: 'United Kingdom',
    rating: 5,
    date: '2 weeks ago',
    suitName: 'Zafran Ochre Embroidered Swiss Lawn 3-Pc',
    stitchingType: 'Standard Stitched (Medium)',
    comment: 'Living abroad in the UK, getting unstitched Pakistani suits stitched properly is always a nightmare. Miss Stitch delivered our complete Eid parcel to London in 8 days with impeccable finishing and interlock.',
    verifiedBuyer: true,
    avatarImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'rev-4',
    name: 'Zahra Al-Hashmi',
    city: 'Dubai (Downtown)',
    country: 'UAE',
    rating: 5,
    date: '2 weeks ago',
    suitName: 'Zarina Midnight Black Chikan Raw Silk 3-Pc',
    stitchingType: 'Custom Made-to-Measure',
    comment: 'Saved my size profile in the Sizing Vault and re-ordered with 1 click. The raw silk fabric drape and neat pico borders are top tier. 5 stars all the way!',
    verifiedBuyer: true,
    avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
];
