'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  updateSilaiStatusAction,
  verifyPaymentAction,
} from '@/app/actions/adminActions';
import {
  Scissors,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  Building2,
  Smartphone,
  Ruler,
  Maximize2,
  X,
} from 'lucide-react';

interface Props {
  order: any;
}

const SILAI_STAGES = [
  { id: 'order_placed', label: '1. Order Placed', desc: 'Awaiting fabric inspection' },
  { id: 'fabric_cut', label: '2. Fabric Cut & Inspected', desc: 'Master cutter finished' },
  { id: 'tailor_stitching', label: '3. Master Tailor Silai', desc: 'Sewing machine station' },
  { id: 'quality_check', label: '4. Quality & Fit Check', desc: 'Lining, latkan, iron press' },
  { id: 'dispatched', label: '5. Dispatched via Courier', desc: 'En route with tracking #' },
];

export const OrderDetailClient: React.FC<Props> = ({ order: initialOrder }) => {
  const [order, setOrder] = useState(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [courierPartner, setCourierPartner] = useState(order.courierPartner || 'TCS Express');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [showReceiptZoom, setShowReceiptZoom] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatPKR = (amount: number) => `PKR ${amount?.toLocaleString('en-PK') || 0}`;

  const handleSilaiChange = async (newStatus: string) => {
    if (newStatus === 'dispatched') {
      setShowCourierModal(true);
      return;
    }

    setIsUpdating(true);
    setStatusMessage(null);
    const res = await updateSilaiStatusAction(order.orderNumber, newStatus);
    setIsUpdating(false);

    if (res.success) {
      setOrder({ ...order, silaiStatus: newStatus });
      setStatusMessage({ type: 'success', text: `Silai status advanced to "${newStatus.replace('_', ' ')}"` });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to update silai status.' });
    }
  };

  const handleCourierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) return;

    setIsUpdating(true);
    const res = await updateSilaiStatusAction(order.orderNumber, 'dispatched', courierPartner, trackingNumber);
    setIsUpdating(false);
    setShowCourierModal(false);

    if (res.success) {
      setOrder({
        ...order,
        silaiStatus: 'dispatched',
        courierPartner,
        trackingNumber,
      });
      setStatusMessage({
        type: 'success',
        text: `Order marked as Dispatched via ${courierPartner} with tracking ${trackingNumber}`,
      });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to dispatch order.' });
    }
  };

  const handleVerifyPayment = async (approved: boolean) => {
    setIsUpdating(true);
    setStatusMessage(null);
    const res = await verifyPaymentAction(order.orderNumber, approved);
    setIsUpdating(false);

    if (res.success) {
      const newPayStatus = approved ? 'verified' : 'rejected';
      const newSilaiStatus = approved ? 'fabric_cut' : 'order_placed';
      setOrder({
        ...order,
        paymentStatus: newPayStatus,
        silaiStatus: newSilaiStatus,
      });
      setStatusMessage({
        type: 'success',
        text: approved
          ? 'Payment verified! Suit automatically queued for Master Cutting.'
          : 'Payment rejected. Customer notified.',
      });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to update payment.' });
    }
  };

  const whatsappLink = `https://wa.me/${(order.shippingAddress?.phone || '').replace(/\D/g, '')}?text=Assalam-o-Alaikum%20${encodeURIComponent(
    order.shippingAddress?.fullName || 'Customer'
  )},%20this%20is%20Miss%20Stitch%20regarding%20your%20order%20%23${order.orderNumber}.`;

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg bg-white border border-[#E5E2DC] hover:bg-[#FAF8F5] text-[#1F1F24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#1F1F24]">
                Order {order.orderNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  order.paymentStatus === 'verified'
                    ? 'bg-[#0A5C36]/10 text-[#0A5C36]'
                    : order.paymentStatus === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Payment: {order.paymentStatus}
              </span>
            </div>
            <p className="text-xs text-[#66666E]">
              Placed on {order.createdAt} • Destination: {order.shippingAddress?.city}, {order.shippingAddress?.province}
            </p>
          </div>
        </div>

        {/* Printable Job Card CTA */}
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/orders/${order.orderNumber}/print-job-card`}
            target="_blank"
            className="px-4 py-2.5 bg-[#FAF5E6] border-2 border-[#D4AF37] rounded-lg text-xs font-bold uppercase tracking-wider text-[#8F741C] hover:bg-[#FAF0D0] flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Print Master Tailor Job Card</span>
          </Link>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-[#0A5C36]/10 border-[#0A5C36]/30 text-[#0A5C36]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. SILAI STATUS PIPELINE CONTROLLER */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E2DC] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
          <div>
            <h2 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#E61A6B]" />
              <span>Workshop Silai Progression Controller</span>
            </h2>
            <p className="text-[11px] text-[#66666E]">
              Advancing status updates the customer&apos;s live tracking timeline in real time.
            </p>
          </div>
          {order.trackingNumber && (
            <div className="text-right text-xs">
              <span className="text-[10px] text-[#8E8E98] uppercase font-bold block">Courier Tracking</span>
              <span className="font-mono font-bold text-[#0A5C36]">
                {order.courierPartner}: {order.trackingNumber}
              </span>
            </div>
          )}
        </div>

        {/* 5 Step Progression Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {SILAI_STAGES.map((stage, idx) => {
            const isCurrent = order.silaiStatus === stage.id;
            const isPassed =
              SILAI_STAGES.findIndex((s) => s.id === order.silaiStatus) >= idx;

            return (
              <button
                key={stage.id}
                type="button"
                disabled={isUpdating}
                onClick={() => handleSilaiChange(stage.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#E61A6B] bg-[#E61A6B]/10 ring-2 ring-[#E61A6B]'
                    : isPassed
                    ? 'border-[#0A5C36]/50 bg-[#0A5C36]/5 hover:border-[#0A5C36]'
                    : 'border-[#E5E2DC] bg-[#FAF8F5] hover:border-[#D4AF37]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[#E61A6B] text-white'
                        : isPassed
                        ? 'bg-[#0A5C36] text-white'
                        : 'bg-[#E5E2DC] text-[#66666E]'
                    }`}
                  >
                    {isPassed && !isCurrent ? '✓' : idx + 1}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#E61A6B]">
                      Active Stage
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-[#1F1F24] leading-snug">{stage.label}</h4>
                <p className="text-[10px] text-[#8E8E98] mt-0.5">{stage.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Suit Items & Custom Measurements (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ordered Suits */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E2DC] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1F1F24] pb-3 border-b border-[#E5E2DC]">
              Suit Items & Stitching Queue ({order.items.length})
            </h3>

            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5E2DC] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#1F1F24]">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-[#66666E] capitalize">
                          Mode: <strong>{item.stitchingType}</strong> {item.size ? `(${item.size})` : ''}
                        </span>
                        <span className="text-xs text-[#8E8E98]">• Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#1F1F24]">
                      {formatPKR(item.totalPrice)}
                    </span>
                  </div>

                  {/* Bespoke Measurement Sheet (if custom made) */}
                  {item.customSpecs && (
                    <div className="bg-white p-4 rounded-lg border border-[#D4AF37]/50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DC]">
                        <span className="font-bold text-xs text-[#8F741C] flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Master Cutter Specifications (Inches)</span>
                        </span>
                        <span className="text-[10px] text-[#0A5C36] font-bold">100% Bespoke Fit</span>
                      </div>

                      {/* Measurement Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                        <div className="p-1.5 bg-[#FAF8F5] rounded">
                          <span className="text-[10px] text-[#8E8E98] block">Length:</span>
                          <strong>{item.customSpecs.kameezLength}&quot;</strong>
                        </div>
                        <div className="p-1.5 bg-[#FAF8F5] rounded">
                          <span className="text-[10px] text-[#8E8E98] block">Chest:</span>
                          <strong>{item.customSpecs.chest}&quot;</strong>
                        </div>
                        <div className="p-1.5 bg-[#FAF8F5] rounded">
                          <span className="text-[10px] text-[#8E8E98] block">Waist:</span>
                          <strong>{item.customSpecs.waist}&quot;</strong>
                        </div>
                        <div className="p-1.5 bg-[#FAF8F5] rounded">
                          <span className="text-[10px] text-[#8E8E98] block">Hips:</span>
                          <strong>{item.customSpecs.hips}&quot;</strong>
                        </div>
                        <div className="p-1.5 bg-[#FAF8F5] rounded">
                          <span className="text-[10px] text-[#8E8E98] block">Shoulder:</span>
                          <strong>{item.customSpecs.shoulder}&quot;</strong>
                        </div>
                        <div className="p-1.5 bg-[#FAF8F5] rounded">
                          <span className="text-[10px] text-[#8E8E98] block">Armhole:</span>
                          <strong>{item.customSpecs.armhole || 8.5}&quot;</strong>
                        </div>
                        <div className="p-1.5 bg-[#FAF8F5] rounded">
                          <span className="text-[10px] text-[#8E8E98] block">Sleeves:</span>
                          <strong>{item.customSpecs.sleeveLength}&quot;</strong>
                        </div>
                        <div className="p-1.5 bg-[#FAF8F5] rounded">
                          <span className="text-[10px] text-[#8E8E98] block">Daman:</span>
                          <strong>{item.customSpecs.daman || 24}&quot;</strong>
                        </div>
                      </div>

                      {/* Trouser & Finishes */}
                      <div className="pt-2 border-t border-[#E5E2DC] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[#8E8E98] block text-[10px]">Trouser Cut & Length:</span>
                          <span className="font-semibold text-[#1F1F24]">
                            {item.customSpecs.trouserType} • {item.customSpecs.trouserLength}&quot; Length (Cuff: {item.customSpecs.trouserCuff}&quot;)
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8E8E98] block text-[10px]">Finishing Add-ons:</span>
                          <span className="font-semibold text-[#0A5C36]">
                            {item.customSpecs.hasShameez ? '✓ Shameez Attached ' : ''}
                            {item.customSpecs.hasLatkan ? '✓ Latkan Tassels' : ''}
                            {!item.customSpecs.hasShameez && !item.customSpecs.hasLatkan ? 'Standard Finish' : ''}
                          </span>
                        </div>
                      </div>

                      {item.customSpecs.customNotes && (
                        <div className="p-2 bg-amber-50 rounded text-[11px] text-amber-900 border border-amber-200">
                          <strong>Client Tailoring Note:</strong> {item.customSpecs.customNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Proof Inspector & Shipping (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 2. PAYMENT VERIFICATION INSPECTOR */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E2DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h3 className="font-serif text-base font-bold text-[#1F1F24] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Payment & Receipt Inspector</span>
              </h3>
              <span className="text-[10px] font-mono text-[#8E8E98] uppercase">
                Method: {order.paymentMethod}
              </span>
            </div>

            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs text-[#66666E] bg-[#FAF8F5] p-3 rounded-lg border border-[#E5E2DC]">
              <div className="flex justify-between">
                <span>Fabric & Silai Subtotal:</span>
                <span className="font-mono text-[#1F1F24] font-semibold">{formatPKR(order.subtotalPKR)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-mono text-[#1F1F24] font-semibold">
                  {order.shippingFeePKR === 0 ? 'FREE' : formatPKR(order.shippingFeePKR)}
                </span>
              </div>
              {order.discountPKR > 0 && (
                <div className="flex justify-between text-[#0A5C36]">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span className="font-mono">-{formatPKR(order.discountPKR)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E5E2DC] flex justify-between font-bold text-sm text-[#1F1F24]">
                <span>Total Due:</span>
                <span className="font-mono text-[#E61A6B] text-base">{formatPKR(order.totalAmountPKR)}</span>
              </div>
            </div>

            {/* Receipt Image / TID View */}
            {order.paymentDetails?.transactionId && (
              <div className="p-3 bg-white rounded border border-[#E5E2DC] text-xs">
                <span className="text-[10px] text-[#8E8E98] uppercase block">Bank / Wallet Transaction ID (TID):</span>
                <span className="font-mono text-sm font-bold text-[#1F1F24]">
                  {order.paymentDetails.transactionId}
                </span>
              </div>
            )}

            {order.paymentDetails?.receiptUrl ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1F1F24] block">Attached Payment Proof:</span>
                <div
                  onClick={() => setShowReceiptZoom(true)}
                  className="relative h-48 w-full rounded-lg overflow-hidden border-2 border-dashed border-[#D4AF37] cursor-pointer group bg-black/5"
                >
                  <Image
                    src={order.paymentDetails.receiptUrl}
                    alt="Payment receipt screenshot"
                    fill
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Maximize2 className="w-4 h-4" />
                    <span>Click to Zoom Screenshot</span>
                  </div>
                </div>
              </div>
            ) : order.paymentMethod === 'cod' ? (
              <div className="p-3 bg-[#0A5C36]/10 text-[#0A5C36] rounded text-xs font-medium">
                Cash on Delivery order. Courier will collect {formatPKR(order.totalAmountPKR)} upon doorstep delivery.
              </div>
            ) : (
              <div className="p-3 bg-amber-50 text-amber-800 rounded text-xs">
                No screenshot uploaded. Customer entered TID above.
              </div>
            )}

            {/* Approval / Rejection Action Buttons */}
            {order.paymentStatus === 'pending' && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleVerifyPayment(true)}
                  className="py-2.5 bg-[#0A5C36] hover:bg-[#074729] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Payment</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleVerifyPayment(false)}
                  className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. CUSTOMER CONTACT & SHIPPING DESTINATION */}
          <div className="bg-white p-6 rounded-xl border border-[#E5E2DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h3 className="font-serif text-base font-bold text-[#1F1F24]">
                Customer Destination
              </h3>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A5C36] bg-[#0A5C36]/10 px-2.5 py-1 rounded hover:bg-[#0A5C36]/20 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-[#0A5C36]" />
                <span>WhatsApp Client</span>
              </a>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-[#8E8E98] uppercase block">Client Name & Mobile:</span>
                <span className="font-bold text-sm text-[#1F1F24]">
                  {order.shippingAddress?.fullName}
                </span>
                <span className="block font-mono text-[#66666E]">
                  📞 {order.shippingAddress?.phone}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8E8E98] uppercase block">Delivery Address:</span>
                <span className="text-[#1F1F24] block">
                  {order.shippingAddress?.address}
                </span>
                <span className="font-semibold text-[#1F1F24] block mt-0.5">
                  {order.shippingAddress?.city}, {order.shippingAddress?.province}
                </span>
              </div>

              {order.customerNotes && (
                <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC] text-[11px]">
                  <strong>Landmark / Delivery Note:</strong> {order.customerNotes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COURIER DISPATCH MODAL */}
      {showCourierModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h3 className="font-serif text-lg font-bold text-[#1F1F24] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0A5C36]" />
                <span>Dispatch Suit via Courier</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCourierModal(false)}
                className="text-[#8E8E98] hover:text-[#1F1F24]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCourierSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">
                  Select Courier Partner *
                </label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#1F1F24]"
                >
                  <option value="TCS Express">TCS Express</option>
                  <option value="Leopards Courier">Leopards Courier</option>
                  <option value="M&P Courier">M&P Express</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="CallCourier">CallCourier</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">
                  Tracking Number / Waybill # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 77491028374"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 font-mono text-sm text-[#1F1F24]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourierModal(false)}
                  className="px-4 py-2 border border-[#E5E2DC] rounded font-semibold text-[#66666E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#0A5C36] text-white rounded font-bold uppercase tracking-wider hover:bg-[#074729]"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT ZOOM MODAL */}
      {showReceiptZoom && order.paymentDetails?.receiptUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowReceiptZoom(false)}
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full h-full bg-white rounded-xl overflow-hidden p-2">
            <button
              type="button"
              onClick={() => setShowReceiptZoom(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={order.paymentDetails.receiptUrl}
                alt="Receipt zoomed screenshot"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
