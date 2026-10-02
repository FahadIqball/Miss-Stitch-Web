'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Order } from '@/types';
import { getOrderByNumberAction } from '@/app/actions/orderActions';
import {
  CheckCircle2,
  Scissors,
  Truck,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Clock,
  Ruler,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  orderNumber: string;
}

export const OrderSuccessClient: React.FC<Props> = ({ orderNumber }) => {
  const { getOrderById } = useAuthStore();
  const { formatPrice } = useCurrencyStore();

  const storeOrder = getOrderById(orderNumber);
  const [order, setOrder] = useState<Order | undefined>(storeOrder);
  const [showSpecs, setShowSpecs] = useState(true);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';

  useEffect(() => {
    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E61A6B', '#D4AF37', '#0A5C36', '#F3A712'],
      });
    } catch {
      // ignore
    }

    // Attempt to fetch from database if store didn't have it or for fresh data
    if (!storeOrder) {
      getOrderByNumberAction(orderNumber).then((fetched) => {
        if (fetched) {
          setOrder(fetched);
        }
      });
    }
  }, [orderNumber, storeOrder]);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header Card */}
        <div className="bg-white border-2 border-[#D4AF37]/50 rounded-2xl p-6 sm:p-10 text-center shadow-md mb-8 relative overflow-hidden">
          <div className="w-20 h-20 bg-[#0A5C36]/10 text-[#0A5C36] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FAF5E6] border border-[#D4AF37]/50 text-[#1F1F24] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E61A6B]" />
            <span>Order Confirmed & Sent to Master Atelier</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F1F24] mb-2">
            Shukriya! Your Order #{orderNumber} is Placed
          </h1>
          <p className="text-xs sm:text-sm text-[#66666E] max-w-lg mx-auto">
            Your suit specifications have been registered in our workshop queue. Our Master Cutters are preparing your fabric.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Assalam-o-Alaikum%20Miss%20Stitch!%20I%20have%20placed%20order%20%23${orderNumber}%20under%20the%20name%20${encodeURIComponent(
                order?.shippingAddress.fullName || 'Customer'
              )}.%20Please%20confirm%20my%20order.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-[#0A5C36] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#074729] transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Get WhatsApp Updates</span>
            </a>

            <Link
              href="/track-order"
              className="btn-gold-outline px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              <span>Track Live Silai Progress</span>
            </Link>
          </div>
        </div>

        {/* 5-Step Silai & Delivery Stepper */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs mb-8">
          <h3 className="font-serif text-base font-bold text-[#1F1F24] mb-6 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#E61A6B]" />
            <span>5-Step Silai & Delivery Timeline</span>
          </h3>

          <div className="relative grid grid-cols-1 sm:grid-cols-5 gap-4 text-center">
            {[
              { step: '1', title: 'Order Confirmed', status: 'completed' },
              { step: '2', title: 'Fabric Cut & Inspected', status: 'current' },
              { step: '3', title: 'Master Tailor Stitching', status: 'upcoming' },
              { step: '4', title: 'Quality & Fit Check', status: 'upcoming' },
              { step: '5', title: 'Dispatched via TCS', status: 'upcoming' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    s.status === 'completed'
                      ? 'bg-[#0A5C36] text-white shadow-xs'
                      : s.status === 'current'
                      ? 'bg-[#E61A6B] text-white animate-pulse shadow-md'
                      : 'bg-[#FAF8F5] text-[#66666E] border border-[#E5E2DC]'
                  }`}
                >
                  {s.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                </div>
                <span
                  className={`text-xs ${
                    s.status === 'current'
                      ? 'font-bold text-[#E61A6B]'
                      : s.status === 'completed'
                      ? 'font-semibold text-[#1F1F24]'
                      : 'text-[#66666E]'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details & Summary Card */}
        {order ? (
          <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E2DC]">
              <div>
                <span className="text-[11px] text-[#66666E] uppercase font-bold tracking-wider">
                  Delivery Destination:
                </span>
                <p className="text-sm font-bold text-[#1F1F24] mt-0.5">
                  {order.shippingAddress.fullName} ({order.shippingAddress.phone})
                </p>
                <p className="text-xs text-[#66666E]">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.province}
                </p>
              </div>
              <div className="sm:text-right">
                <span className="text-[11px] text-[#66666E] uppercase font-bold tracking-wider">
                  Payment Method:
                </span>
                <p className="text-sm font-bold text-[#0A5C36] capitalize mt-0.5">
                  {order.paymentMethod.replace('_', ' ')}
                </p>
                <span className="text-[10px] text-[#66666E] block">
                  Status: <strong className="uppercase">{order.paymentStatus}</strong>
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#1F1F24]">
                Ordered Items ({order.items.length})
              </h4>
              {order.items.map((item) => (
                <div key={item.id} className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E5E2DC] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 relative rounded bg-white overflow-hidden shrink-0 border border-[#E5E2DC]">
                        <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="48px" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#1F1F24]">{item.title}</h5>
                        <span className="text-[10px] text-[#0A5C36] font-semibold block capitalize">
                          Mode: {item.stitchingMode} {item.standardSize ? `(${item.standardSize})` : ''}
                        </span>
                        {item.addons.attachedLining && (
                          <span className="text-[9px] bg-white border border-[#D4AF37]/50 text-[#8F741C] px-1.5 py-0.2 rounded inline-block mr-1">
                            + Shameez Lining
                          </span>
                        )}
                        {item.addons.edgeFinishingTassels && (
                          <span className="text-[9px] bg-white border border-[#E61A6B]/50 text-[#E61A6B] px-1.5 py-0.2 rounded inline-block">
                            + Latkan Tassels
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-[#1F1F24]">
                        {formatPrice(item.unitTotalPKR * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Custom Measurement Breakdown if applicable */}
                  {item.customMeasurements && (
                    <div className="pt-2 border-t border-[#E5E2DC]/80">
                      <button
                        type="button"
                        onClick={() => setShowSpecs(!showSpecs)}
                        className="flex items-center justify-between w-full text-[11px] font-semibold text-[#8F741C] hover:text-[#1F1F24]"
                      >
                        <span className="flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Custom Silai Measurements Submitted</span>
                        </span>
                        {showSpecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {showSpecs && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 p-2 bg-white rounded border border-[#E5E2DC] text-[10px] font-mono text-[#1F1F24]">
                          <div>Length: <strong>{item.customMeasurements.shirtLength}&quot;</strong></div>
                          <div>Chest: <strong>{item.customMeasurements.chest}&quot;</strong></div>
                          <div>Waist: <strong>{item.customMeasurements.waist}&quot;</strong></div>
                          <div>Hips: <strong>{item.customMeasurements.hips}&quot;</strong></div>
                          <div>Shoulder: <strong>{item.customMeasurements.shoulder}&quot;</strong></div>
                          <div>Sleeves: <strong>{item.customMeasurements.sleeveLength}&quot;</strong></div>
                          <div>Trouser: <strong>{item.customMeasurements.trouserLength}&quot;</strong></div>
                          <div>Style: <strong>{item.customMeasurements.trouserStyle}</strong></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-[#E5E2DC] space-y-1.5 text-xs text-[#66666E]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-[#1F1F24] font-semibold">{formatPrice(order.subtotalPKR)}</span>
              </div>
              <div className="flex justify-between">
                <span>Nationwide Courier (TCS):</span>
                <span className="font-mono font-semibold">
                  {order.shippingFeePKR === 0 ? <span className="text-[#0A5C36] font-bold">FREE</span> : formatPrice(order.shippingFeePKR)}
                </span>
              </div>
              {order.discountPKR > 0 && (
                <div className="flex justify-between text-[#0A5C36] font-semibold">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-{formatPrice(order.discountPKR)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E5E2DC] flex justify-between items-center text-sm font-bold text-[#1F1F24]">
                <span>Total Amount:</span>
                <span className="font-mono text-xl text-[#E61A6B]">{formatPrice(order.totalPKR)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white border border-[#E5E2DC] rounded-xl text-center text-xs text-[#66666E]">
            Loading detailed order receipt...
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="btn-rani px-8 py-3 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <span>Continue Shopping Miss Stitch</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
