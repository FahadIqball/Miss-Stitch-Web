'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CustomerAddress } from '@/types';
import { createOrderAction } from '@/app/actions/orderActions';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

const CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Gujranwala',
  'Sialkot',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Sheikhupura',
  'Rahim Yar Khan',
  'Jhelum',
  'Gujrat',
  'Mardan',
  'International / Diaspora',
];

export const CheckoutClient: React.FC = () => {
  const router = useRouter();
  const {
    items,
    getSubtotalPKR,
    getStitchingTotalPKR,
    getAddonsTotalPKR,
    getShippingFeePKR,
    getTotalPKR,
    discountPKR,
    promoCode,
    clearCart,
  } = useCartStore();

  const { formatPrice } = useCurrencyStore();
  const { user, addresses, addOrder } = useAuthStore();

  // Form State (Default to logged-in user if available, otherwise blank for guest)
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/^\+92\s?/, '') : '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(addresses[0]?.address || '');
  const [landmark, setLandmark] = useState(addresses[0]?.landmark || '');
  const [province, setProvince] = useState(addresses[0]?.province || 'Punjab');
  const [city, setCity] = useState(addresses[0]?.city || 'Lahore');
  const [postalCode, setPostalCode] = useState(addresses[0]?.postalCode || '');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'jazzcash_easypaisa' | 'bank_transfer'>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = getSubtotalPKR();
  const stitchingTotal = getStitchingTotalPKR();
  const addonsTotal = getAddonsTotalPKR();
  const shippingFee = getShippingFeePKR();
  const grandTotal = getTotalPKR();

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Receipt file size must be less than 5 MB.');
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setReceiptBase64(result);
      if (file.type.startsWith('image/')) {
        setReceiptPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceiptFileName(null);
    setReceiptBase64(null);
    setReceiptPreview(null);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // 1. Pakistani mobile number validation
    const digitsOnly = phone.replace(/\D/g, '');
    const isValidPhone = /^(03\d{9}|3\d{9})$/.test(digitsOnly);
    if (!isValidPhone) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g., 300 1234567 or 0300 1234567).');
      setIsSubmitting(false);
      return;
    }

    // 2. Enforce payment proof for manual transfers (IBFT / JazzCash / Easypaisa)
    if (paymentMethod === 'bank_transfer' || paymentMethod === 'jazzcash_easypaisa') {
      const hasValidTid = Boolean(transactionId && transactionId.trim().length >= 5);
      const hasReceiptFile = Boolean(receiptBase64);
      if (!hasValidTid && !hasReceiptFile) {
        setErrorMessage(
          'For manual payment verification, please provide either the Transaction ID (TID) or upload your payment receipt screenshot before placing your order.'
        );
        setIsSubmitting(false);
        return;
      }
    }

    const shippingAddress: CustomerAddress = {
      id: `addr-${Date.now()}`,
      fullName,
      phone: `+92 ${digitsOnly.slice(-10)}`,
      email,
      address,
      landmark,
      province,
      city,
      postalCode,
    };

    const res = await createOrderAction({
      items,
      shippingAddress,
      paymentMethod,
      promoCode: promoCode || undefined,
      receiptBase64: receiptBase64 || undefined,
      receiptFileName: receiptFileName || undefined,
      transactionId: transactionId || undefined,
    });

    if (!res.success || !res.orderNumber) {
      setErrorMessage(res.error || 'Failed to complete order. Please review your details and try again.');
      setIsSubmitting(false);
      return;
    }

    // Save to local Zustand store for instant optimistic access
    if (res.order) {
      addOrder(res.order);
    }

    // Clear cart and redirect
    clearCart();
    router.push(`/order-success/${res.orderNumber}`);
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen py-16 text-center px-4">
        <div className="max-w-md mx-auto bg-white border border-[#E5E2DC] rounded-xl p-8 shadow-xs">
          <h2 className="font-serif text-2xl font-bold text-[#1F1F24] mb-2">No Items to Checkout</h2>
          <p className="text-xs text-[#66666E] mb-6">Your shopping bag is empty. Add festive suits first.</p>
          <Link href="/shop" className="btn-rani px-6 py-2.5 rounded text-xs font-bold uppercase">
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#66666E] mb-6">
          <Link href="/cart" className="hover:text-[#E61A6B]">Bag</Link>
          <span>/</span>
          <span className="text-[#1F1F24] font-semibold">1-Page Express Checkout</span>
        </nav>

        <div className="flex items-center justify-between pb-4 mb-8 border-b border-[#E5E2DC]">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1F24]">
              1-Page Express Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#66666E] mt-1">
              Guaranteed 100% genuine Pakistani designer fabrics & bespoke silai.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#0A5C36] font-bold bg-[#0A5C36]/10 px-3 py-1.5 rounded">
            <Lock className="w-4 h-4" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="flex-1 font-medium">{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Customer, Shipping & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact Details */}
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
                <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#E61A6B]" />
                  <span>1. Contact & Customer Information</span>
                </h2>
                <span className="text-[10px] text-[#0A5C36] font-bold uppercase">SMS & WhatsApp Alerts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1F1F24] mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-[#66666E]">🇵🇰 +92</span>
                    <input
                      type="tel"
                      required
                      placeholder="300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 pl-18 font-mono text-sm font-semibold text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1F1F24] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Khan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#1F1F24] mb-1">
                    Email Address (For e-receipt & PDF size specs)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ayesha@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
                <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#0A5C36]" />
                  <span>2. Delivery Address in Pakistan</span>
                </h2>
                <span className="text-[10px] text-[#66666E] font-semibold">TCS / Leopard Courier</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#1F1F24] mb-1">
                    Street Address, House #, Plot #, Building *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House 42-B, Street 7, Block F, Gulberg III"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#1F1F24] mb-1">
                    Area Landmark / Famous Point (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Main Market / Gol Masjid / PSO Pump"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1F1F24] mb-1">Province *</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1F1F24] mb-1">City / District *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
                <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[#F3A712]" />
                  <span>3. Localized Payment Method</span>
                </h2>
                <span className="text-[10px] text-[#0A5C36] font-bold">100% Safe & Zero Gateway Fees</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* COD */}
                <label
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-[#E61A6B] bg-[#FAF5E6]'
                      : 'border-[#E5E2DC] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#E61A6B] mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1F1F24]">Cash on Delivery (COD)</span>
                        <span className="bg-[#0A5C36] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                          Most Popular
                        </span>
                      </div>
                      <p className="text-[#66666E] text-xs mt-0.5">
                        Pay physical cash to the courier representative when your parcel is delivered at your doorstep.
                      </p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-[#0A5C36] shrink-0" />
                </label>

                {/* 1Link Direct Bank Transfer */}
                <label
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#E61A6B] bg-[#FAF5E6]'
                      : 'border-[#E5E2DC] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="accent-[#E61A6B] mt-1"
                    />
                    <div>
                      <span className="font-bold text-sm text-[#1F1F24]">1Link / IBFT Online Bank Transfer</span>
                      <p className="text-[#66666E] text-xs mt-0.5">
                        Transfer to Meezan Bank official account & attach screenshot / Transaction ID.
                      </p>
                    </div>
                  </div>
                  <Building2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                </label>

                {/* JazzCash / EasyPaisa */}
                <label
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                    paymentMethod === 'jazzcash_easypaisa'
                      ? 'border-[#E61A6B] bg-[#FAF5E6]'
                      : 'border-[#E5E2DC] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'jazzcash_easypaisa'}
                      onChange={() => setPaymentMethod('jazzcash_easypaisa')}
                      className="accent-[#E61A6B] mt-1"
                    />
                    <div>
                      <span className="font-bold text-sm text-[#1F1F24]">JazzCash / EasyPaisa Mobile Wallet</span>
                      <p className="text-[#66666E] text-xs mt-0.5">
                        Transfer directly to Miss Stitch mobile account and attach payment screenshot.
                      </p>
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-[#E61A6B] shrink-0" />
                </label>

                {/* Cards Sandbox */}
                <label
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between ${
                    paymentMethod === 'card'
                      ? 'border-[#E61A6B] bg-[#FAF5E6]'
                      : 'border-[#E5E2DC] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#E61A6B] mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1F1F24]">Debit / Credit Card</span>
                        <span className="bg-[#D4AF37]/20 text-[#8F741C] text-[9px] font-bold px-1.5 py-0.2 rounded">
                          Sandbox Test Mode
                        </span>
                      </div>
                      <p className="text-[#66666E] text-xs mt-0.5">
                        Instant simulated authorization for Visa, Mastercard, and PayPak without gateway fees.
                      </p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-[#1F1F24] shrink-0" />
                </label>
              </div>

              {/* Sub-panel: Bank Transfer Details */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 bg-[#FAF5E6] border border-[#D4AF37] rounded-lg text-xs space-y-3 animate-in fade-in">
                  <h4 className="font-bold text-[#1F1F24]">Miss Stitch Official Bank Account (Meezan Bank)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded border border-[#E5E2DC]">
                    <p><strong>Account Title:</strong> Miss Stitch Couture</p>
                    <p><strong>Bank:</strong> Meezan Bank Ltd</p>
                    <p className="sm:col-span-2"><strong>IBAN:</strong> PK36MEZN0001928374618291</p>
                    <p><strong>Branch:</strong> Gulberg Main Boulevard, Lahore</p>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">
                      Bank Transaction ID / Reference (Provide TID or Upload Receipt below) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MEZN-849201"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-white border border-[#E5E2DC] rounded p-2 text-xs text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">
                      Upload Bank Transfer Screenshot:
                    </label>
                    <input
                      type="file"
                      id="bank-receipt-input"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleReceiptFileChange}
                      className="hidden"
                    />

                    {receiptFileName ? (
                      <div className="p-3 bg-white border border-[#0A5C36] rounded flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#0A5C36] font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-xs">{receiptFileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeReceipt}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="bank-receipt-input"
                        className="w-full py-3 border-2 border-dashed border-[#D4AF37] rounded text-xs flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-[#FAF8F5] transition-colors"
                      >
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-semibold text-[#1F1F24]">Click to Upload Payment Screenshot (JPG, PNG, PDF)</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-panel: JazzCash / Easypaisa */}
              {paymentMethod === 'jazzcash_easypaisa' && (
                <div className="p-4 bg-[#FAF5E6] border border-[#E61A6B]/50 rounded-lg text-xs space-y-3 animate-in fade-in">
                  <h4 className="font-bold text-[#1F1F24]">Miss Stitch Mobile Wallet Accounts</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded border border-[#E5E2DC]">
                    <p><strong>JazzCash:</strong> 0300 1234567</p>
                    <p><strong>EasyPaisa:</strong> 0300 1234567</p>
                    <p className="sm:col-span-2"><strong>Account Title:</strong> Miss Stitch Official</p>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">
                      Wallet Transaction ID (TID) from SMS (Provide TID or Upload Screenshot below) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TID 092837418"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-white border border-[#E5E2DC] rounded p-2 text-xs text-[#1F1F24] focus:outline-none focus:border-[#E61A6B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">
                      Upload JazzCash / EasyPaisa Screenshot:
                    </label>
                    <input
                      type="file"
                      id="wallet-receipt-input"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleReceiptFileChange}
                      className="hidden"
                    />

                    {receiptFileName ? (
                      <div className="p-3 bg-white border border-[#0A5C36] rounded flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#0A5C36] font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-xs">{receiptFileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeReceipt}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="wallet-receipt-input"
                        className="w-full py-3 border-2 border-dashed border-[#E61A6B]/50 rounded text-xs flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-[#FAF8F5] transition-colors"
                      >
                        <Upload className="w-4 h-4 text-[#E61A6B]" />
                        <span className="font-semibold text-[#1F1F24]">Upload Payment Confirmation Screenshot</span>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Order Summary & Place Order (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border-2 border-[#D4AF37]/50 rounded-xl p-6 shadow-sm space-y-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-[#1F1F24] pb-3 border-b border-[#E5E2DC]">
                Order Summary ({items.length} Items)
              </h2>

              {/* Mini Item Previews */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                    <div className="w-12 h-14 relative rounded bg-white overflow-hidden shrink-0 border border-[#E5E2DC]">
                      <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#1F1F24] truncate">{item.title}</h4>
                      <p className="text-[10px] text-[#66666E] capitalize">
                        {item.stitchingMode === 'custom'
                          ? 'Bespoke Custom Made'
                          : item.stitchingMode === 'standard'
                          ? `Stitched (${item.standardSize})`
                          : 'Unstitched Fabric'}
                      </p>
                      <p className="text-[10px] font-mono text-[#E61A6B] font-bold">
                        Qty: {item.quantity} × {formatPrice(item.unitTotalPKR)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-xs text-[#66666E] pt-3 border-t border-[#E5E2DC]">
                <div className="flex justify-between">
                  <span>Fabric Subtotal:</span>
                  <span className="font-mono text-[#1F1F24] font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {stitchingTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Custom Silai Charges:</span>
                    <span className="font-mono text-[#1F1F24] font-semibold">+{formatPrice(stitchingTotal)}</span>
                  </div>
                )}
                {addonsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Lining & Tassels:</span>
                    <span className="font-mono text-[#1F1F24] font-semibold">+{formatPrice(addonsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Nationwide Shipping:</span>
                  <span className="font-mono font-semibold">
                    {shippingFee === 0 ? <span className="text-[#0A5C36] font-bold">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                {discountPKR > 0 && (
                  <div className="flex justify-between text-[#0A5C36] font-semibold">
                    <span>Discount ({promoCode}):</span>
                    <span className="font-mono">-{formatPrice(discountPKR)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#E5E2DC] flex justify-between items-baseline font-bold text-sm text-[#1F1F24]">
                  <span>Grand Total to Pay:</span>
                  <span className="font-mono text-2xl text-[#E61A6B]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-rani w-full py-4 rounded text-center text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Your Order...</span>
                  </div>
                ) : (
                  <>
                    <span>Complete Order — {formatPrice(grandTotal)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Guarantees */}
              <div className="space-y-2 pt-2 text-[11px] text-[#66666E]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0A5C36] shrink-0" />
                  <span>100% Original Brand Fabric & Fit Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>7–10 Days Bespoke Delivery with SMS Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
