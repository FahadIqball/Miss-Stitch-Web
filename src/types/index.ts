export type StitchingMode = 'unstitched' | 'standard' | 'custom';

export type StandardSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type ShirtLengthOption = 'standard_42' | 'long_46';

export type TrouserStyle = 
  | 'cigarette' 
  | 'loose_shalwar' 
  | 'tulip_shalwar' 
  | 'bell_bottom' 
  | 'straight_trouser';

export interface CustomMeasurements {
  shirtLength: number; // inches
  chest: number;       // inches
  waist: number;       // inches
  hips: number;        // inches
  shoulder: number;    // inches
  sleeveLength: number;// inches
  armhole?: number;    // inches
  neckDepth?: number;  // inches
  trouserLength: number;// inches
  trouserStyle: TrouserStyle;
}

export interface FinishingAddons {
  attachedLining: boolean;      // +PKR 1,000 (Pure Cotton/Silk Shameez)
  edgeFinishingTassels: boolean;// +PKR 800 (Pico, Patti, Latkan)
  sleevesLining: boolean;      // +PKR 500
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  collection: string; // e.g. "Festive Luxury Lawn '26", "Velvet Formals", "Raw Silk Pret"
  sku: string;
  category: 'unstitched' | 'ready-to-wear' | 'festive' | 'velvet' | 'co-ords';
  pieceCount: '1-Piece' | '2-Piece' | '3-Piece';
  fabric: 'Lawn' | 'Chiffon' | 'Raw Silk' | 'Organza' | 'Velvet' | 'Cotton' | 'Jacquard';
  fabricDescription: string;
  colorName: string;
  colorHex: string;
  basePricePKR: number; // Unstitched or Ready-to-wear base
  standardStitchingFeePKR: number; // Default 3500
  customStitchingFeePKR: number; // Default 4500
  images: {
    primary: string;
    secondary: string; // back or drape view
    gallery: string[];
    embroideryCloseUp?: string;
  };
  tags: string[]; // e.g. ["Ready to Ship", "Hand Embroidered", "Selling Fast"]
  occasion: 'Daily Wear' | 'Semi-Formal' | 'Wedding / Festive' | 'Eid Edit';
  boxContents: {
    shirt: string;
    dupatta: string;
    trouser: string;
    embroideryPatches: string[];
  };
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  inStock: boolean;
}

export interface CartItem {
  id: string; // UUID
  productId: string;
  title: string;
  collection: string;
  thumbnail: string;
  basePricePKR: number;
  stitchingMode: StitchingMode;
  standardSize?: StandardSize;
  shirtLengthOption?: ShirtLengthOption;
  customMeasurements?: CustomMeasurements;
  savedProfileName?: string;
  addons: FinishingAddons;
  stitchingFeePKR: number;
  addonsFeePKR: number;
  unitTotalPKR: number;
  quantity: number;
  specialInstructions?: string;
}

export interface SizingProfile {
  id: string;
  name: string; // e.g. "My Standard Fit", "Ami's Shalwar Suit"
  measurements: CustomMeasurements;
  isDefault?: boolean;
  createdAt: string;
}

export type CurrencyCode = 'PKR' | 'USD' | 'GBP' | 'AED';

export interface CurrencyRates {
  PKR: number;
  USD: number;
  GBP: number;
  AED: number;
}

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  landmark?: string;
  province: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "MS-94821"
  createdAt: string;
  items: CartItem[];
  shippingAddress: CustomerAddress;
  paymentMethod: 'cod' | 'card' | 'jazzcash_easypaisa' | 'bank_transfer';
  paymentStatus: 'pending' | 'verified' | 'paid';
  subtotalPKR: number;
  stitchingTotalPKR: number;
  addonsTotalPKR: number;
  shippingFeePKR: number;
  discountPKR: number;
  totalPKR: number;
  status: 'confirmed' | 'fabric_cut' | 'master_tailor' | 'quality_check' | 'dispatched' | 'delivered';
  trackingNumber?: string;
  courierPartner?: 'TCS Express' | 'Leopards Courier' | 'CallCourier' | 'DHL International';
  notes?: string;
  receiptImage?: string;
}

export type UserRole = 'customer' | 'admin' | 'tailor';

export interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  isCurrentUser?: boolean;
}

export interface HeroSlide {
  id: number | string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  tag: string;
}

export interface AnnouncementBarSettings {
  enabled: boolean;
  primaryMessage: string;
  secondaryMessage?: string;
  promoCode?: string;
  whatsappNumber?: string;
}

export interface CategoryCardItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  image: string;
}

