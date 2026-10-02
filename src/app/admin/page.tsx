import React from 'react';
import Link from 'next/link';
import { getAdminStatsAction, getAdminOrdersAction } from '@/app/actions/adminActions';
import {
  Scissors,
  CheckCircle2,
  Clock,
  Banknote,
  Truck,
  ArrowRight,
  Printer,
  Eye,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const revalidate = 0; // Fresh dynamic data
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stats = await getAdminStatsAction();
  const recentOrders = await getAdminOrdersAction('all');

  const formatPKR = (amount: number) => {
    return `PKR ${amount.toLocaleString('en-PK')}`;
  };

  const pendingApprovals = recentOrders.filter(
    (o) => o.paymentStatus === 'pending' && ['bank_transfer', 'jazzcash_easypaisa'].includes(o.paymentMethod)
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E2DC] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0A5C36]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0A5C36]">
              Master Atelier Dispatch
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24]">
            Workshop Operations Dashboard
          </h1>
          <p className="text-xs text-[#66666E] mt-1">
            Live Silai tracking queue, manual IBFT receipt approvals, and master tailor job cards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="btn-rani px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs"
          >
            <Scissors className="w-4 h-4" />
            <span>Open Silai Queue</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E2DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66666E]">
            <span>Total Orders Placed</span>
            <span className="p-2 rounded-lg bg-[#FAF5E6] text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 font-serif text-2xl font-bold text-[#1F1F24]">
            {stats.totalOrders}
          </div>
          <p className="text-[11px] text-[#0A5C36] font-semibold mt-1">
            Nationwide & Diaspora
          </p>
        </div>

        {/* In-Silai Active */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E2DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66666E]">
            <span>Active in Silai Pipeline</span>
            <span className="p-2 rounded-lg bg-[#E61A6B]/10 text-[#E61A6B]">
              <Scissors className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 font-serif text-2xl font-bold text-[#E61A6B]">
            {stats.activeSilaiCount}
          </div>
          <p className="text-[11px] text-[#66666E] font-medium mt-1">
            Cutting, Sewing, or Fit Check
          </p>
        </div>

        {/* Pending Payment Verification */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E2DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66666E]">
            <span>Pending IBFT / JazzCash</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 font-serif text-2xl font-bold text-amber-600">
            {stats.pendingPaymentCount}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Awaiting receipt verification
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E2DC] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66666E]">
            <span>Workshop Revenue</span>
            <span className="p-2 rounded-lg bg-[#0A5C36]/10 text-[#0A5C36]">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 font-mono text-xl font-bold text-[#0A5C36]">
            {formatPKR(stats.totalRevenuePKR)}
          </div>
          <p className="text-[11px] text-[#66666E] font-medium mt-1">
            Fabric + Bespoke Stitching Fees
          </p>
        </div>
      </div>

      {/* Urgent Action Needed Banner (if any pending payments) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {pendingApprovals.length} Payment Receipts Awaiting Workshop Approval
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Inspect customer bank transfer screenshots to advance suits to the Master Cutting station.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders?status=pending"
            className="px-4 py-2 bg-amber-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors shrink-0 text-center"
          >
            Review Receipts Now
          </Link>
        </div>
      )}

      {/* Recent Orders Queue */}
      <div className="bg-white rounded-xl border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E5E2DC] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-[#1F1F24]">
              Recent Silai & Delivery Queue
            </h3>
            <p className="text-xs text-[#66666E]">
              Click on any order to view custom measurements or print job cards.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#E61A6B] hover:underline flex items-center gap-1"
          >
            <span>View All Orders ({recentOrders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#66666E] uppercase font-bold text-[10px] tracking-wider border-b border-[#E5E2DC]">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer & City</th>
                <th className="py-3 px-4">Items / Mode</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Silai Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]">
              {recentOrders.slice(0, 8).map((order) => (
                <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  {/* Order Number */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1F1F24]">
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="text-[#E61A6B] hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="block text-[10px] text-[#8E8E98] font-normal">
                      {order.createdAt}
                    </span>
                  </td>

                  {/* Customer & City */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#1F1F24] block">{order.customerName}</span>
                    <span className="text-[#66666E] text-[11px] block">
                      📍 {order.city} ({order.customerPhone})
                    </span>
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#1F1F24]">
                      {order.itemsCount} {order.itemsCount === 1 ? 'Suit' : 'Suits'}
                    </span>
                    {order.hasCustomStitching ? (
                      <span className="block text-[10px] text-[#D4AF37] font-bold">
                        ✂️ Custom Made-to-Measure
                      </span>
                    ) : (
                      <span className="block text-[10px] text-[#66666E]">
                        Standard / Unstitched
                      </span>
                    )}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1F1F24]">
                    {formatPKR(order.totalAmountPKR)}
                  </td>

                  {/* Payment */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.paymentStatus === 'verified'
                          ? 'bg-[#0A5C36]/10 text-[#0A5C36]'
                          : order.paymentStatus === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span className="block text-[10px] text-[#8E8E98] capitalize mt-0.5">
                      {order.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Silai Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                        order.silaiStatus === 'delivered'
                          ? 'bg-[#0A5C36] text-white'
                          : order.silaiStatus === 'dispatched'
                          ? 'bg-[#D4AF37] text-[#1F1F24]'
                          : order.silaiStatus === 'quality_check'
                          ? 'bg-purple-100 text-purple-800'
                          : order.silaiStatus === 'tailor_stitching'
                          ? 'bg-[#E61A6B] text-white animate-pulse'
                          : order.silaiStatus === 'fabric_cut'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-[#FAF5E6] text-[#8F741C] border border-[#D4AF37]/40'
                      }`}
                    >
                      {order.silaiStatus.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#E5E2DC] rounded hover:border-[#D4AF37] text-[11px] font-bold text-[#1F1F24]"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#66666E]" />
                      <span>Inspect</span>
                    </Link>

                    <Link
                      href={`/admin/orders/${order.orderNumber}/print-job-card`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF5E6] border border-[#D4AF37]/50 rounded hover:bg-[#FAF0D0] text-[11px] font-bold text-[#8F741C]"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Job Card</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
