'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useUIStore } from '@/store/useUIStore';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Scissors,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Truck,
  FileText,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotalPKR,
    getStitchingTotalPKR,
    getAddonsTotalPKR,
    getTotalPKR,
    getFreeShippingProgress,
    specialOrderNote,
    setSpecialOrderNote,
  } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  const [expandedMeasurements, setExpandedMeasurements] = useState<Record<string, boolean>>({});
  const [showNoteInput, setShowNoteInput] = useState(false);

  const toggleMeasurementView = (itemId: string) => {
    setExpandedMeasurements((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const { progressPercentage, remainingPKR, isFree } = getFreeShippingProgress();
  const subtotal = getSubtotalPKR();
  const stitchingTotal = getStitchingTotalPKR();
  const addonsTotal = getAddonsTotalPKR();
  const total = getTotalPKR();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeCartDrawer}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Shopping Bag Drawer"
          className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E5E2DC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1F1F24]" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1F1F24]">
                Your Shopping Bag ({items.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              className="p-1.5 rounded-full text-[#66666E] hover:text-[#1F1F24] hover:bg-[#FAF8F5] transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#FAF5E6] border-b border-[#D4AF37]/30 p-3 sm:p-4 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[#1F1F24] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#0A5C36]" />
                {isFree ? (
                  <span className="text-[#0A5C36] font-bold">
                    🎉 You have qualified for FREE Delivery across Pakistan!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#E61A6B]">{formatPrice(remainingPKR)}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
              </span>
              <span className="font-bold text-[#1F1F24]">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-[#E5E2DC] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0A5C36] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-white border border-[#E5E2DC] rounded-full flex items-center justify-center mx-auto mb-4 text-[#66666E]">
                  <ShoppingBag className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1F1F24] mb-2">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-[#66666E] max-w-xs mx-auto mb-6">
                  Explore our luxury festive lawn, velvet formals, and bespoke digital silai suits.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    window.location.href = '/shop';
                  }}
                  className="btn-rani px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E5E2DC] rounded-lg p-3 sm:p-4 shadow-xs relative"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-24 relative rounded bg-[#FAF8F5] overflow-hidden shrink-0 border border-[#E5E2DC]">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#66666E]">
                            {item.collection}
                          </span>
                          <h4 className="text-xs font-bold text-[#1F1F24] truncate max-w-[180px]">
                            {item.title}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#66666E] hover:text-[#E61A6B] p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Stitching Mode Badge */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {item.stitchingMode === 'unstitched' && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#1F1F24] border border-[#E5E2DC] text-[10px] font-semibold">
                            Unstitched Fabric
                          </span>
                        )}
                        {item.stitchingMode === 'standard' && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF5E6] text-[#1F1F24] border border-[#D4AF37] text-[10px] font-bold">
                            Standard Size: {item.standardSize} ({item.shirtLengthOption === 'long_46' ? '46" Long' : '42" Standard'})
                          </span>
                        )}
                        {item.stitchingMode === 'custom' && (
                          <span className="px-2 py-0.5 rounded bg-[#E61A6B]/10 text-[#E61A6B] border border-[#E61A6B]/30 text-[10px] font-bold flex items-center gap-1">
                            <Scissors className="w-3 h-3" />
                            <span>Custom Made-to-Measure</span>
                          </span>
                        )}
                      </div>

                      {/* Add-ons tag */}
                      {(item.addons.attachedLining || item.addons.edgeFinishingTassels || item.addons.sleevesLining) && (
                        <p className="text-[10px] text-[#0A5C36] font-medium mt-1">
                          Included: {item.addons.attachedLining && 'Cotton Lining (Shameez)'}
                          {item.addons.attachedLining && item.addons.edgeFinishingTassels && ' + '}
                          {item.addons.edgeFinishingTassels && 'Pico/Latkan Tassels'}
                        </p>
                      )}

                      {/* Expandable Custom Measurements Drawer */}
                      {item.stitchingMode === 'custom' && item.customMeasurements && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => toggleMeasurementView(item.id)}
                            className="text-[11px] text-[#1F1F24] font-semibold flex items-center gap-1 hover:text-[#E61A6B] underline"
                          >
                            <span>
                              {expandedMeasurements[item.id]
                                ? 'Hide inch measurements'
                                : 'View entered measurements'}
                            </span>
                            {expandedMeasurements[item.id] ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {expandedMeasurements[item.id] && (
                            <div className="mt-2 p-2 bg-[#FAF8F5] border border-[#E5E2DC] rounded text-[10px] grid grid-cols-2 gap-x-2 gap-y-1">
                              <div>Length: <strong>{item.customMeasurements.shirtLength}&quot;</strong></div>
                              <div>Chest: <strong>{item.customMeasurements.chest}&quot;</strong></div>
                              <div>Waist: <strong>{item.customMeasurements.waist}&quot;</strong></div>
                              <div>Hips: <strong>{item.customMeasurements.hips}&quot;</strong></div>
                              <div>Shoulder: <strong>{item.customMeasurements.shoulder}&quot;</strong></div>
                              <div>Sleeve: <strong>{item.customMeasurements.sleeveLength}&quot;</strong></div>
                              <div>Trouser: <strong>{item.customMeasurements.trouserLength}&quot;</strong></div>
                              <div className="capitalize col-span-2 text-[#0A5C36] font-semibold">
                                Cut: {item.customMeasurements.trouserStyle.replace('_', ' ')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Price & Quantity Adjuster */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E5E2DC]">
                        <div className="flex items-center border border-[#E5E2DC] rounded bg-[#FAF8F5]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-[#66666E] hover:text-[#1F1F24] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#1F1F24]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-[#66666E] hover:text-[#1F1F24] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#1F1F24]">
                            {formatPrice(item.unitTotalPKR * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="block text-[10px] text-[#66666E]">
                              ({formatPrice(item.unitTotalPKR)} each)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Special Instructions Box */}
            {items.length > 0 && (
              <div className="pt-2">
                {!showNoteInput ? (
                  <button
                    type="button"
                    onClick={() => setShowNoteInput(true)}
                    className="text-xs text-[#66666E] hover:text-[#1F1F24] flex items-center gap-1.5 font-medium underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>
                      {specialOrderNote
                        ? 'Edit tailoring instructions'
                        : '+ Add special note for master tailor'}
                    </span>
                  </button>
                ) : (
                  <div className="bg-white border border-[#E5E2DC] rounded p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1F1F24]">
                        Master Tailor Instructions
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowNoteInput(false)}
                        className="text-[11px] text-[#66666E] hover:text-[#1F1F24]"
                      >
                        Done
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={specialOrderNote}
                      onChange={(e) => setSpecialOrderNote(e.target.value)}
                      placeholder="e.g. Please add extra lining on sheer sleeves and match tassels with gold zari..."
                      className="w-full p-2 border border-[#E5E2DC] rounded text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#E5E2DC] space-y-3">
              {/* Cost Breakdown */}
              <div className="space-y-1.5 text-xs text-[#66666E] pb-2 border-b border-[#E5E2DC]">
                <div className="flex justify-between">
                  <span>Fabric Subtotal:</span>
                  <span className="font-mono text-[#1F1F24]">{formatPrice(subtotal)}</span>
                </div>
                {stitchingTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Stitching Charges:</span>
                    <span className="font-mono text-[#1F1F24]">{formatPrice(stitchingTotal)}</span>
                  </div>
                )}
                {addonsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Linings & Finishes:</span>
                    <span className="font-mono text-[#1F1F24]">{formatPrice(addonsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[#1F1F24] pt-1">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-[#E61A6B] text-base">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Turnaround Alert */}
              <div className="flex items-center gap-2 text-[11px] text-[#0A5C36] bg-[#0A5C36]/10 p-2 rounded">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#0A5C36]" />
                <span>
                  Bespoke stitching dispatched in <strong>7–10 working days</strong>
                </span>
              </div>

              {/* Checkout CTAs */}
              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCartDrawer}
                  className="btn-rani w-full py-3 rounded text-center text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Proceed to 1-Page Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    window.location.href = '/cart';
                  }}
                  className="w-full py-2 bg-transparent text-[#1F1F24] hover:bg-[#FAF8F5] text-xs font-semibold rounded border border-[#E5E2DC] transition-colors"
                >
                  View Detailed Bag Breakdown
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
