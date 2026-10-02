'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Scissors,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CartPageClient: React.FC = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotalPKR,
    getStitchingTotalPKR,
    getAddonsTotalPKR,
    getShippingFeePKR,
    getTotalPKR,
    getFreeShippingProgress,
    promoCode,
    discountPKR,
    applyPromoCode,
    removePromoCode,
    specialOrderNote,
    setSpecialOrderNote,
  } = useCartStore();

  const { formatPrice } = useCurrencyStore();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [expandedMeasurements, setExpandedMeasurements] = useState<Record<string, boolean>>({});

  const toggleMeasurements = (id: string) => {
    setExpandedMeasurements((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const success = applyPromoCode(promoInput);
    if (!success) {
      setPromoError('Invalid coupon. Try "FESTIVE10" or "SILAI500"');
    } else {
      setPromoInput('');
    }
  };

  const { progressPercentage, remainingPKR, isFree } = getFreeShippingProgress();
  const subtotal = getSubtotalPKR();
  const stitchingTotal = getStitchingTotalPKR();
  const addonsTotal = getAddonsTotalPKR();
  const shippingFee = getShippingFeePKR();
  const grandTotal = getTotalPKR();

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-[#66666E] mb-6">
          <Link href="/" className="hover:text-[#E61A6B]">Home</Link>
          <span>/</span>
          <span className="text-[#1F1F24] font-semibold">Shopping Bag Breakdown</span>
        </nav>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1F24] mb-8">
          Your Shopping Bag & Bespoke Silai Breakdown
        </h1>

        {items.length === 0 ? (
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 bg-[#FAF5E6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1F1F24] mb-2">
              Your bag is currently empty
            </h2>
            <p className="text-xs text-[#66666E] mb-6">
              Explore our festive lawn, velvet formals, and digital tailor-made suits.
            </p>
            <Link
              href="/shop"
              className="btn-rani px-8 py-3 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Line Items (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Free Delivery Tracker Bar */}
              <div className="bg-[#FAF5E6] border border-[#D4AF37]/50 rounded-xl p-4 text-xs shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-[#1F1F24]">
                    <Truck className="w-4 h-4 text-[#0A5C36]" />
                    {isFree ? (
                      <span className="text-[#0A5C36] font-bold">
                        🎉 Congratulations! You have unlocked FREE Delivery across Pakistan!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-[#E61A6B]">{formatPrice(remainingPKR)}</strong> more to qualify for <strong>FREE Delivery</strong>
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[#1F1F24] font-mono">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-[#E5E2DC] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#0A5C36] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E5E2DC] rounded-xl p-4 sm:p-6 shadow-xs relative"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-32 relative rounded-lg bg-[#FAF8F5] overflow-hidden shrink-0 border border-[#E5E2DC]">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#66666E]">
                            {item.collection}
                          </span>
                          <h3 className="font-serif text-base font-bold text-[#1F1F24]">
                            {item.title}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#66666E] hover:text-[#E61A6B] p-1.5 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Stitching Badge */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {item.stitchingMode === 'unstitched' && (
                          <span className="px-2.5 py-1 rounded bg-[#FAF8F5] text-[#1F1F24] border border-[#E5E2DC] text-xs font-semibold">
                            Unstitched Fabric
                          </span>
                        )}
                        {item.stitchingMode === 'standard' && (
                          <span className="px-2.5 py-1 rounded bg-[#FAF5E6] text-[#1F1F24] border border-[#D4AF37] text-xs font-bold">
                            Standard Size {item.standardSize} ({item.shirtLengthOption === 'long_46' ? '46" Long' : '42" Standard'})
                          </span>
                        )}
                        {item.stitchingMode === 'custom' && (
                          <span className="px-2.5 py-1 rounded bg-[#E61A6B]/10 text-[#E61A6B] border border-[#E61A6B]/30 text-xs font-bold flex items-center gap-1">
                            <Scissors className="w-3.5 h-3.5" />
                            <span>Custom Made-to-Measure</span>
                          </span>
                        )}
                      </div>

                      {/* Add-ons tag */}
                      {(item.addons.attachedLining || item.addons.edgeFinishingTassels || item.addons.sleevesLining) && (
                        <div className="mt-2 text-xs text-[#0A5C36] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            Included: {item.addons.attachedLining && 'Cotton Lining (Shameez)'}
                            {item.addons.attachedLining && item.addons.edgeFinishingTassels && ' • '}
                            {item.addons.edgeFinishingTassels && 'Pico & Latkan Tassels'}
                          </span>
                        </div>
                      )}

                      {/* Expandable Measurements */}
                      {item.stitchingMode === 'custom' && item.customMeasurements && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => toggleMeasurements(item.id)}
                            className="text-xs text-[#1F1F24] font-semibold flex items-center gap-1 hover:text-[#E61A6B] underline"
                          >
                            <span>
                              {expandedMeasurements[item.id]
                                ? 'Hide inch measurements'
                                : 'View entered inch measurements'}
                            </span>
                            {expandedMeasurements[item.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {expandedMeasurements[item.id] && (
                            <div className="mt-2 p-3 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>Shirt Length: <strong>{item.customMeasurements.shirtLength}&quot;</strong></div>
                              <div>Chest: <strong>{item.customMeasurements.chest}&quot;</strong></div>
                              <div>Waist: <strong>{item.customMeasurements.waist}&quot;</strong></div>
                              <div>Hips: <strong>{item.customMeasurements.hips}&quot;</strong></div>
                              <div>Shoulder: <strong>{item.customMeasurements.shoulder}&quot;</strong></div>
                              <div>Sleeves: <strong>{item.customMeasurements.sleeveLength}&quot;</strong></div>
                              <div>Trouser: <strong>{item.customMeasurements.trouserLength}&quot;</strong></div>
                              <div className="capitalize text-[#0A5C36] font-semibold">
                                Cut: {item.customMeasurements.trouserStyle.replace('_', ' ')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Itemized Price & Quantity */}
                      <div className="mt-4 pt-3 border-t border-[#E5E2DC] flex items-center justify-between">
                        <div className="flex items-center border border-[#E5E2DC] rounded bg-[#FAF8F5]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-xs font-bold text-[#66666E] hover:text-[#1F1F24]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold font-mono text-[#1F1F24]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs font-bold text-[#66666E] hover:text-[#1F1F24]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-base font-bold text-[#1F1F24]">
                            {formatPrice(item.unitTotalPKR * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[11px] text-[#66666E]">
                              ({formatPrice(item.unitTotalPKR)} each)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Special Tailor Instructions */}
              <div className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-xs">
                <h3 className="font-serif text-sm font-bold text-[#1F1F24] mb-2 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#D4AF37]" />
                  <span>Special Notes for Master Tailor (Optional)</span>
                </h3>
                <textarea
                  rows={2}
                  value={specialOrderNote}
                  onChange={(e) => setSpecialOrderNote(e.target.value)}
                  placeholder="e.g. Please ensure latkan tassels match border color, or keep neckline conservative..."
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-3 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Right: Order Summary (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border-2 border-[#D4AF37]/50 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-xl font-bold text-[#1F1F24] pb-3 border-b border-[#E5E2DC]">
                  Order Bag Summary
                </h3>

                {/* Breakdown */}
                <div className="space-y-3 text-xs text-[#66666E]">
                  <div className="flex justify-between">
                    <span>Fabric Subtotal:</span>
                    <span className="font-mono text-[#1F1F24] font-semibold">{formatPrice(subtotal)}</span>
                  </div>

                  {stitchingTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Stitching Charges:</span>
                      <span className="font-mono text-[#1F1F24] font-semibold">+{formatPrice(stitchingTotal)}</span>
                    </div>
                  )}

                  {addonsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Linings & Finishing Add-ons:</span>
                      <span className="font-mono text-[#1F1F24] font-semibold">+{formatPrice(addonsTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Nationwide Shipping:</span>
                    <span className="font-mono font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-[#0A5C36] font-bold">FREE</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  {discountPKR > 0 && (
                    <div className="flex justify-between text-[#0A5C36] font-semibold pt-1">
                      <span>Promo Discount ({promoCode}):</span>
                      <span className="font-mono">-{formatPrice(discountPKR)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E5E2DC] flex justify-between items-baseline font-bold text-sm text-[#1F1F24]">
                    <span>Total Amount (PKR):</span>
                    <span className="font-mono text-2xl text-[#E61A6B]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Promo Code Box */}
                <div className="pt-2">
                  {promoCode ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#0A5C36]/10 border border-[#0A5C36]/30 rounded-lg text-xs">
                      <div className="flex items-center gap-1.5 text-[#0A5C36] font-bold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Code &ldquo;{promoCode}&rdquo; Applied</span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-xs text-[#E61A6B] font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo code (e.g. FESTIVE10)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="bg-[#FAF8F5] border border-[#E5E2DC] rounded px-3 py-2 text-xs text-[#1F1F24] flex-1 focus:outline-none focus:border-[#D4AF37] uppercase font-mono"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#1F1F24] text-white rounded text-xs font-bold uppercase hover:bg-[#E61A6B] transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[11px] text-[#E61A6B] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{promoError}</span>
                        </p>
                      )}
                    </form>
                  )}
                </div>

                {/* Turnaround Badge */}
                <div className="p-3 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#0A5C36] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Estimated Turnaround:</span>
                  </div>
                  <p className="text-[11px] text-[#66666E]">
                    Unstitched suits ship in 24 hours. Custom Silai dispatched in 7–10 working days.
                  </p>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="btn-rani w-full py-3.5 rounded text-center text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Proceed to 1-Page Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 text-center">
                  <Link
                    href="/shop"
                    className="text-xs text-[#66666E] hover:text-[#1F1F24] underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
