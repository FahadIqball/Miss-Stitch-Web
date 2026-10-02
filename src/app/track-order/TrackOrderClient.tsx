'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Order } from '@/types';
import { trackOrderAction } from '@/app/actions/accountActions';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  Scissors,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  Radio,
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const urlOrderParam = searchParams.get('order');

  const { orders } = useAuthStore();
  const { formatPrice } = useCurrencyStore();

  const [orderQuery, setOrderQuery] = useState(urlOrderParam || '');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923001234567';

  // If order param was passed in URL, auto-search it on load
  useEffect(() => {
    if (urlOrderParam) {
      setOrderQuery(urlOrderParam);
      trackOrderAction(urlOrderParam).then((found) => {
        if (found) {
          setSearchedOrder(found);
        }
      });
    }
  }, [urlOrderParam]);

  // Live Supabase Realtime CDC subscription
  useEffect(() => {
    if (!searchedOrder?.orderNumber) return;
    if (!isSupabaseConfigured()) return;

    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`order-live-${searchedOrder.orderNumber}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `order_number=eq.${searchedOrder.orderNumber}`,
          },
          (payload: any) => {
            const updated = payload.new;
            if (updated) {
              setSearchedOrder((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  status: (updated.silai_status === 'fabric_cut'
                    ? 'fabric_cut'
                    : updated.silai_status === 'tailor_stitching'
                    ? 'master_tailor'
                    : updated.silai_status === 'quality_check'
                    ? 'quality_check'
                    : updated.silai_status === 'dispatched'
                    ? 'dispatched'
                    : updated.silai_status === 'delivered'
                    ? 'delivered'
                    : 'confirmed') as any,
                  courierPartner: (updated.courier_name || prev.courierPartner) as any,
                  trackingNumber: updated.tracking_number || prev.trackingNumber,
                };
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsRealtimeConnected(true);
          }
        });

      return () => {
        supabase.removeChannel(channel);
        setIsRealtimeConnected(false);
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  }, [searchedOrder?.orderNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const query = orderQuery.trim().toUpperCase();
    if (!query) return;

    setIsSearching(true);
    // 1. Try server-side Supabase lookup
    const remote = await trackOrderAction(query);
    setIsSearching(false);

    if (remote) {
      setSearchedOrder(remote);
      return;
    }

    // 2. Check local store fallback
    const local = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === query ||
        o.shippingAddress.phone.includes(query) ||
        (o.trackingNumber && o.trackingNumber.toUpperCase() === query)
    );

    if (local) {
      setSearchedOrder(local);
    } else {
      setError(`No parcel found for "${orderQuery}". Please check your Order Number or Phone.`);
    }
  };

  // Determine stage flags
  const isDelivered = searchedOrder?.status === 'delivered';
  const isDispatched = searchedOrder?.status === 'dispatched' || isDelivered;
  const isQC = searchedOrder?.status === 'quality_check' || isDispatched;
  const isStitching = searchedOrder?.status === 'master_tailor' || isQC;
  const isCut = searchedOrder?.status === 'fabric_cut' || isStitching;

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A5C36]/10 text-[#0A5C36] text-xs font-bold uppercase tracking-widest mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Nationwide & Global Courier Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F1F24]">
            Track Your Silai & Parcel Progress
          </h1>
          <p className="text-xs sm:text-sm text-[#66666E] mt-2">
            Enter your <strong>Miss Stitch Order #</strong> (e.g. MS-70578) or <strong>TCS Tracking ID</strong>.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white border-2 border-[#D4AF37]/40 rounded-xl p-4 sm:p-6 shadow-xs mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#66666E] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="Enter Order # (e.g. MS-70578) or TCS Tracking #"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg py-3 pl-11 pr-4 text-sm text-[#1F1F24] focus:outline-none focus:border-[#E61A6B] font-mono font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="btn-rani px-8 py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <Truck className="w-4 h-4" />
              <span>{isSearching ? 'Searching...' : 'Track Parcel'}</span>
            </button>
          </form>

          {error && (
            <p className="text-xs text-[#E61A6B] mt-3 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Search Results */}
        {searchedOrder && (
          <div className="space-y-6 animate-in fade-in">
            {/* Status Card */}
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl font-bold text-[#1F1F24]">
                      Order #{searchedOrder.orderNumber}
                    </span>
                    <span className="bg-[#0A5C36]/10 text-[#0A5C36] text-xs font-bold px-2.5 py-1 rounded capitalize">
                      {searchedOrder.status.replace('_', ' ')}
                    </span>
                    {isRealtimeConnected && (
                      <span className="inline-flex items-center gap-1 bg-[#0A5C36]/10 text-[#0A5C36] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A5C36] animate-ping" />
                        <span>Live CDC Stream</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#66666E] mt-1">
                    Courier: <strong className="text-[#1F1F24]">{searchedOrder.courierPartner || 'TCS Express'}</strong> • Tracking Code:{' '}
                    <strong className="font-mono text-[#E61A6B]">{searchedOrder.trackingNumber || 'Pending Dispatch'}</strong>
                  </p>
                </div>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=Assalam-o-Alaikum%20Miss%20Stitch!%20Inquiry%20regarding%20live%20status%20of%20Order%20%23${searchedOrder.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0A5C36] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#074729] transition-colors self-start sm:self-auto shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp Atelier</span>
                </a>
              </div>

              {/* 5-Step Silai Timeline */}
              <div className="py-8">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center">
                  {[
                    { step: '1', title: 'Order Confirmed', subtitle: 'Fabric Reserved', done: true },
                    { step: '2', title: 'Fabric Cut', subtitle: 'Inspected by Master', done: isCut, current: searchedOrder.status === 'fabric_cut' },
                    { step: '3', title: 'Master Silai', subtitle: 'Custom Tailoring', done: isStitching, current: searchedOrder.status === 'master_tailor' },
                    { step: '4', title: 'Quality Check', subtitle: 'Lining, Tassels & Press', done: isQC, current: searchedOrder.status === 'quality_check' },
                    { step: '5', title: 'Dispatched', subtitle: 'Delivered by TCS', done: isDelivered, current: searchedOrder.status === 'dispatched' },
                  ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                          s.current
                            ? 'bg-[#E61A6B] text-white animate-pulse shadow-lg ring-4 ring-[#E61A6B]/20'
                            : s.done
                            ? 'bg-[#0A5C36] text-white shadow-xs'
                            : 'bg-[#FAF8F5] text-[#66666E] border-2 border-[#E5E2DC]'
                        }`}
                      >
                        {s.done && !s.current ? <CheckCircle2 className="w-6 h-6" /> : s.step}
                      </div>
                      <span
                        className={`text-xs ${
                          s.current
                            ? 'font-bold text-[#E61A6B]'
                            : s.done
                            ? 'font-semibold text-[#1F1F24]'
                            : 'text-[#66666E]'
                        }`}
                      >
                        {s.title}
                      </span>
                      <span className="text-[10px] text-[#8E8E98] mt-0.5">{s.subtitle}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination & Package Details */}
              <div className="pt-6 border-t border-[#E5E2DC] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8E8E98] font-bold uppercase block text-[10px]">
                    Delivery Destination:
                  </span>
                  <p className="font-bold text-[#1F1F24] mt-0.5">
                    {searchedOrder.shippingAddress?.fullName} ({searchedOrder.shippingAddress?.phone})
                  </p>
                  <p className="text-[#66666E]">
                    {searchedOrder.shippingAddress?.address}, {searchedOrder.shippingAddress?.city},{' '}
                    {searchedOrder.shippingAddress?.province}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[#8E8E98] font-bold uppercase block text-[10px]">
                    Payment Mode & Total:
                  </span>
                  <p className="font-bold text-[#0A5C36] capitalize mt-0.5">
                    {searchedOrder.paymentMethod?.replace('_', ' ')} • Status: {searchedOrder.paymentStatus}
                  </p>
                  <p className="font-mono font-bold text-sm text-[#1F1F24]">
                    {formatPrice(searchedOrder.totalPKR)}
                  </p>
                </div>
              </div>

              {/* Items in Parcel */}
              <div className="mt-6 pt-6 border-t border-[#E5E2DC] space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#1F1F24]">
                  Items in this Parcel ({searchedOrder.items.length})
                </h4>
                {searchedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-lg border border-[#E5E2DC]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 relative rounded bg-white overflow-hidden shrink-0 border border-[#E5E2DC]">
                        <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="40px" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-[#1F1F24]">{item.title}</h5>
                        <p className="text-[10px] text-[#0A5C36] font-semibold capitalize">
                          {item.stitchingMode === 'custom'
                            ? 'Bespoke Made-to-Measure Silai'
                            : `Stitched (${item.standardSize})`}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#1F1F24]">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tailoring Guarantee Footer */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-[#66666E]">
          <div className="p-4 bg-white rounded-lg border border-[#E5E2DC] shadow-xs">
            <ShieldCheck className="w-6 h-6 text-[#0A5C36] mx-auto mb-2" />
            <h4 className="font-bold text-[#1F1F24] mb-1">Guaranteed Fitting</h4>
            <p className="text-[11px]">Free alterations if measurements differ by more than 0.5 inches.</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-[#E5E2DC] shadow-xs">
            <Clock className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
            <h4 className="font-bold text-[#1F1F24] mb-1">7–10 Days Turnaround</h4>
            <p className="text-[11px]">Direct from our Lahore atelier straight to your doorstep.</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-[#E5E2DC] shadow-xs">
            <Package className="w-6 h-6 text-[#E61A6B] mx-auto mb-2" />
            <h4 className="font-bold text-[#1F1F24] mb-1">TCS Insured Dispatch</h4>
            <p className="text-[11px]">Secure, tamper-proof luxury packaging nationwide.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const TrackOrderClient: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] py-16 text-center text-xs">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
};
