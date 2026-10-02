'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminOrderListItem } from '@/app/actions/adminActions';
import {
  Scissors,
  Eye,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  ArrowUpDown,
} from 'lucide-react';

interface Props {
  initialOrders: AdminOrderListItem[];
}

const TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'order_placed', label: '1. Order Placed' },
  { id: 'fabric_cut', label: '2. Fabric Cut' },
  { id: 'tailor_stitching', label: '3. In Silai' },
  { id: 'quality_check', label: '4. Quality Check' },
  { id: 'dispatched', label: '5. Dispatched' },
  { id: 'pending', label: 'Pending Payment' },
];

export const OrdersListClient: React.FC<Props> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<AdminOrderListItem[]>(initialOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatPKR = (amount: number) => {
    return `PKR ${amount.toLocaleString('en-PK')}`;
  };

  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab === 'pending') {
      if (order.paymentStatus !== 'pending') return false;
    } else if (activeTab !== 'all') {
      if (order.silaiStatus !== activeTab) return false;
    }

    // Search query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1F1F24]">
            Silai Pipeline & Order Queue
          </h1>
          <p className="text-xs text-[#66666E] mt-0.5">
            Manage cutting schedules, tailor assignments, courier tracking, and payment verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#66666E]">Total Active Queue:</span>
          <span className="font-mono text-xs font-bold text-[#1F1F24] bg-white px-2.5 py-1 rounded border border-[#E5E2DC]">
            {filteredOrders.length} Orders
          </span>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E2DC] shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E8E98] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order # (e.g. MS-84920), Customer Name, Phone, or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg pl-10 pr-4 py-2 text-xs text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-[#E5E2DC] pt-3">
          {TABS.map((tab) => {
            const count =
              tab.id === 'all'
                ? orders.length
                : tab.id === 'pending'
                ? orders.filter((o) => o.paymentStatus === 'pending').length
                : orders.filter((o) => o.silaiStatus === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all text-[11px] flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#1F1F24] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#66666E] hover:bg-[#E5E2DC]/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                    activeTab === tab.id ? 'bg-white text-[#1F1F24]' : 'bg-[#E5E2DC] text-[#1F1F24]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#66666E] uppercase font-bold text-[10px] tracking-wider border-b border-[#E5E2DC]">
              <tr>
                <th className="py-3 px-4">Order Details</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Stitching Specifications</th>
                <th className="py-3 px-4">Payment Info</th>
                <th className="py-3 px-4">Silai Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8E8E98] text-xs">
                    No orders match the selected filter or search term.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Order Details */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="font-mono font-bold text-[#E61A6B] hover:underline block text-sm"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="text-[10px] text-[#8E8E98] block">
                        Placed: {order.createdAt}
                      </span>
                      <span className="font-mono font-bold text-[#1F1F24] block mt-1">
                        {formatPKR(order.totalAmountPKR)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#1F1F24] block">{order.customerName}</span>
                      <span className="text-[#66666E] text-[11px] block">
                        📞 {order.customerPhone}
                      </span>
                      <span className="text-[10px] text-[#8E8E98] block">
                        📍 {order.city}
                      </span>
                    </td>

                    {/* Stitching */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#1F1F24] block">
                        {order.itemsCount} {order.itemsCount === 1 ? 'Suit' : 'Suits'}
                      </span>
                      {order.hasCustomStitching ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8F741C] bg-[#FAF5E6] border border-[#D4AF37]/50 px-2 py-0.5 rounded mt-1">
                          <Scissors className="w-3 h-3" />
                          <span>Custom Made-to-Measure</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#66666E] block">
                          Standard Ready / Unstitched
                        </span>
                      )}
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
                      <span className="block text-[10px] text-[#8E8E98] capitalize mt-1">
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E5E2DC] rounded hover:border-[#D4AF37] text-[11px] font-bold text-[#1F1F24] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#66666E]" />
                        <span>Inspect</span>
                      </Link>

                      <Link
                        href={`/admin/orders/${order.orderNumber}/print-job-card`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF5E6] border border-[#D4AF37]/50 rounded hover:bg-[#FAF0D0] text-[11px] font-bold text-[#8F741C] transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Job Card</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
