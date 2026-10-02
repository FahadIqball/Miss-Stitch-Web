'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useVaultStore } from '@/store/useVaultStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useUIStore } from '@/store/useUIStore';
import { CustomMeasurements, TrouserStyle, Order } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import {
  getSizingProfilesAction,
  saveSizingProfileAction,
  deleteSizingProfileAction,
  getUserOrdersAction,
} from '@/app/actions/accountActions';
import {
  User,
  Scissors,
  Truck,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Phone,
  LogOut,
  Ruler,
  MessageCircle,
} from 'lucide-react';

const TROUSER_OPTIONS: { id: TrouserStyle; label: string }[] = [
  { id: 'straight_trouser', label: 'Straight Trouser' },
  { id: 'cigarette', label: 'Cigarette Pants' },
  { id: 'loose_shalwar', label: 'Loose Shalwar' },
  { id: 'tulip_shalwar', label: 'Tulip Shalwar' },
  { id: 'bell_bottom', label: 'Flared Bell Bottom' },
];

export const AccountClient: React.FC = () => {
  const { user, isAuthenticated, orders: localOrders, addresses, addAddress, deleteAddress, logout } = useAuthStore();
  const { profiles, addProfile, deleteProfile, setDefaultProfile, setProfiles, clearProfiles } = useVaultStore();
  const { formatPrice } = useCurrencyStore();
  const { openAuthModal } = useUIStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'vault' | 'addresses'>('orders');
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // New Profile Form State
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [newMeasurements, setNewMeasurements] = useState<CustomMeasurements>({
    shirtLength: 42,
    chest: 36,
    waist: 30,
    hips: 39,
    shoulder: 14,
    sleeveLength: 21,
    armhole: 8.5,
    neckDepth: 7,
    trouserLength: 38,
    trouserStyle: 'straight_trouser',
  });

  // New Address Form State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    landmark: '',
    province: 'Punjab',
    city: 'Lahore',
    postalCode: '54000',
  });

  // Fetch live orders and sizing profiles from Supabase on mount
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingData(true);
      Promise.all([
        getUserOrdersAction(user?.phone, user?.email),
        getSizingProfilesAction(),
      ])
        .then(([fetchedOrders, fetchedProfiles]) => {
          setRemoteOrders(fetchedOrders || []);
          if (fetchedProfiles) {
            setProfiles(fetchedProfiles);
          }
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [isAuthenticated, user?.phone, user?.email, setProfiles]);

  // Authenticated user orders strictly sourced from verified remote account
  const orders = remoteOrders;

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    logout();
    clearProfiles();
    setRemoteOrders([]);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    const res = await saveSizingProfileAction({
      name: profileName,
      measurements: newMeasurements,
      isDefault: profiles.length === 0,
    });

    if (res.success && res.profile) {
      addProfile(res.profile.name, res.profile.measurements, res.profile.isDefault);
    } else if (!res.success) {
      alert(res.error || 'Failed to save sizing profile to database.');
      return;
    }

    setShowAddProfileModal(false);
    setProfileName('');
  };

  const handleDeleteProfile = async (id: string) => {
    deleteProfile(id);
    await deleteSizingProfileAction(id);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddr.address.trim()) {
      addAddress({ ...newAddr, isDefault: addresses.length === 0 });
      setShowAddAddressModal(false);
      setNewAddr({
        fullName: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '',
        landmark: '',
        province: 'Punjab',
        city: 'Lahore',
        postalCode: '54000',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#E5E2DC] rounded-xl p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-[#FAF5E6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#E61A6B]">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1F1F24] mb-2">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-[#66666E] mb-6">
            Access your saved Sizing Vault profiles, live courier tracking, and order history.
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="btn-rani px-8 py-3 rounded text-xs font-bold uppercase tracking-wider w-full cursor-pointer"
          >
            Sign In with Mobile OTP / Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Banner */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1F1F24] text-[#D4AF37] flex items-center justify-center font-serif text-2xl font-bold border-2 border-[#D4AF37]">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : user?.email
                ? user.email.charAt(0).toUpperCase()
                : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#1F1F24]">
                  {user?.name || 'Valued Customer'}
                </h1>
                <span className="bg-[#0A5C36]/10 text-[#0A5C36] text-[10px] font-bold px-2 py-0.5 rounded">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-[#66666E] mt-1 flex items-center gap-3">
                {user?.phone && <span>📞 {user.phone}</span>}
                {user?.email && <span>✉️ {user.email}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 border border-[#E5E2DC] rounded text-xs font-semibold text-[#66666E] hover:text-[#1F1F24] hover:bg-[#FAF8F5] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E2DC] mb-8 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#E61A6B] text-[#E61A6B]'
                : 'border-transparent text-[#66666E] hover:text-[#1F1F24]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>My Orders & Silai Status ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'vault'
                ? 'border-[#E61A6B] text-[#E61A6B]'
                : 'border-transparent text-[#66666E] hover:text-[#1F1F24]'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Sizing Vault Profiles ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-[#E61A6B] text-[#E61A6B]'
                : 'border-transparent text-[#66666E] hover:text-[#1F1F24]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses ({addresses.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & SILAI STATUS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {isLoadingData && (
              <div className="p-4 bg-white border border-[#E5E2DC] rounded-lg text-center text-xs text-[#66666E]">
                Syncing your live orders from Supabase Atelier...
              </div>
            )}

            {orders.length === 0 ? (
              <div className="bg-white border border-[#E5E2DC] rounded-xl p-12 text-center shadow-xs">
                <p className="text-sm text-[#66666E]">No active orders found.</p>
                <Link
                  href="/shop"
                  className="btn-rani px-6 py-2.5 rounded text-xs font-bold uppercase mt-4 inline-block shadow-sm"
                >
                  Shop Designer Suits
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                // Determine stepper stage
                const isDelivered = order.status === 'delivered';
                const isDispatched = order.status === 'dispatched' || isDelivered;
                const isQC = order.status === 'quality_check' || isDispatched;
                const isStitching = order.status === 'master_tailor' || order.status === 'fabric_cut' || isQC;

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-6"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E2DC]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-bold text-[#1F1F24]">
                            Order #{order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold capitalize ${
                              order.status === 'delivered'
                                ? 'bg-[#0A5C36] text-white'
                                : order.status === 'dispatched'
                                ? 'bg-[#D4AF37] text-[#1F1F24]'
                                : 'bg-[#0A5C36]/10 text-[#0A5C36]'
                            }`}
                          >
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-[#66666E]">
                          Placed on {order.createdAt} • Courier:{' '}
                          <strong className="text-[#1F1F24]">
                            {order.courierPartner || 'TCS Express'}
                          </strong>{' '}
                          • Tracking:{' '}
                          <strong className="font-mono text-[#E61A6B]">
                            {order.trackingNumber || 'Pending Dispatch'}
                          </strong>
                        </span>
                      </div>

                      <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <span className="font-mono text-lg font-bold text-[#E61A6B]">
                          {formatPrice(order.totalPKR)}
                        </span>
                        <Link
                          href={`/track-order?order=${order.orderNumber}`}
                          className="px-3 py-1 bg-[#FAF5E6] border border-[#D4AF37]/50 rounded text-[11px] font-bold text-[#8F741C] hover:bg-[#FAF0D0] flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Track Live Silai</span>
                        </Link>
                      </div>
                    </div>

                    {/* 5-Step Stepper */}
                    <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5E2DC]">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                        {[
                          { title: 'Order Confirmed', done: true },
                          { title: 'Fabric Cut', done: isStitching },
                          { title: 'Master Silai', done: isQC, current: order.status === 'master_tailor' },
                          { title: 'Quality Inspection', done: isDispatched, current: order.status === 'quality_check' },
                          { title: 'Dispatched via Courier', done: isDelivered, current: order.status === 'dispatched' },
                        ].map((st, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                                st.current
                                  ? 'bg-[#E61A6B] text-white animate-pulse shadow-md'
                                  : st.done
                                  ? 'bg-[#0A5C36] text-white shadow-xs'
                                  : 'bg-[#E5E2DC] text-[#66666E]'
                              }`}
                            >
                              {st.done ? '✓' : i + 1}
                            </div>
                            <span
                              className={`text-[11px] ${
                                st.current
                                  ? 'font-bold text-[#E61A6B]'
                                  : st.done
                                  ? 'font-semibold text-[#1F1F24]'
                                  : 'text-[#66666E]'
                              }`}
                            >
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-lg border border-[#E5E2DC]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 relative rounded bg-white overflow-hidden shrink-0 border border-[#E5E2DC]">
                              <Image
                                src={item.thumbnail}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#1F1F24]">{item.title}</h4>
                              <p className="text-[11px] text-[#66666E] capitalize">
                                Mode: {item.stitchingMode}{' '}
                                {item.standardSize ? `(${item.standardSize})` : ''}
                              </p>
                              {item.addons.attachedLining && (
                                <span className="text-[9px] bg-white border border-[#D4AF37]/50 text-[#8F741C] px-1 rounded mr-1">
                                  + Shameez
                                </span>
                              )}
                              {item.addons.edgeFinishingTassels && (
                                <span className="text-[9px] bg-white border border-[#E61A6B]/50 text-[#E61A6B] px-1 rounded">
                                  + Latkan
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#1F1F24]">
                            {formatPrice(item.unitTotalPKR * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MY SIZING VAULT */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1F1F24] flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#D4AF37]" />
                  <span>Personal Digital Sizing Vault</span>
                </h3>
                <p className="text-xs text-[#66666E] mt-1">
                  Save your body measurements once in inches. Select your profile during 1-click checkout for guaranteed bespoke fit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProfileModal(true)}
                className="btn-rani px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Measurement Profile</span>
              </button>
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profiles.map((prof) => (
                <div
                  key={prof.id}
                  className={`bg-white rounded-xl p-6 border-2 transition-all space-y-4 shadow-xs ${
                    prof.isDefault ? 'border-[#D4AF37]' : 'border-[#E5E2DC]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base font-bold text-[#1F1F24]">
                        {prof.name}
                      </h4>
                      {prof.isDefault && (
                        <span className="bg-[#D4AF37]/20 text-[#8F741C] text-[10px] font-bold px-2 py-0.5 rounded">
                          Default Profile
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteProfile(prof.id)}
                      className="text-[#66666E] hover:text-red-600 p-1 cursor-pointer"
                      aria-label="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Measurement Matrix */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#8E8E98] block">Length:</span>
                      <strong>{prof.measurements.shirtLength}&quot;</strong>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#8E8E98] block">Chest:</span>
                      <strong>{prof.measurements.chest}&quot;</strong>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#8E8E98] block">Waist:</span>
                      <strong>{prof.measurements.waist}&quot;</strong>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#8E8E98] block">Hips:</span>
                      <strong>{prof.measurements.hips}&quot;</strong>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#8E8E98] block">Shoulder:</span>
                      <strong>{prof.measurements.shoulder}&quot;</strong>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#8E8E98] block">Sleeves:</span>
                      <strong>{prof.measurements.sleeveLength}&quot;</strong>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#8E8E98] block">Trouser:</span>
                      <strong>{prof.measurements.trouserLength}&quot;</strong>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded border border-[#E5E2DC]">
                      <span className="text-[10px] text-[#8E8E98] block">Cut:</span>
                      <strong className="capitalize truncate block">
                        {prof.measurements.trouserStyle?.replace('_', ' ')}
                      </strong>
                    </div>
                  </div>

                  {!prof.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultProfile(prof.id)}
                      className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
                    >
                      Set as Default Checkout Profile
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1F1F24]">
                  Saved Pakistani Delivery Addresses
                </h3>
                <p className="text-xs text-[#66666E] mt-1">
                  Speed up checkout with your saved homes, offices, and family addresses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(true)}
                className="btn-rani px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs space-y-3 relative"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DC]">
                    <span className="font-bold text-sm text-[#1F1F24]">{addr.fullName}</span>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="text-[#66666E] hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#1F1F24] leading-relaxed">
                    {addr.address}
                    {addr.landmark && <span className="block text-[#66666E]">Near: {addr.landmark}</span>}
                  </p>
                  <p className="text-xs font-semibold text-[#66666E]">
                    {addr.city}, {addr.province} {addr.postalCode}
                  </p>
                  <p className="text-xs font-mono text-[#0A5C36]">📞 {addr.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: ADD SIZING PROFILE */}
        {showAddProfileModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
                <h3 className="font-serif text-lg font-bold text-[#1F1F24] flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#E61A6B]" />
                  <span>Create Sizing Vault Profile</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className="text-[#8E8E98] hover:text-[#1F1F24] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1F1F24] mb-1">
                    Profile Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Festive Shalwar Kameez / Ammi's Kurti"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#1F1F24]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">Length (Inches)</label>
                    <input
                      type="number"
                      value={newMeasurements.shirtLength}
                      onChange={(e) =>
                        setNewMeasurements({ ...newMeasurements, shirtLength: Number(e.target.value) })
                      }
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">Chest</label>
                    <input
                      type="number"
                      value={newMeasurements.chest}
                      onChange={(e) =>
                        setNewMeasurements({ ...newMeasurements, chest: Number(e.target.value) })
                      }
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">Waist</label>
                    <input
                      type="number"
                      value={newMeasurements.waist}
                      onChange={(e) =>
                        setNewMeasurements({ ...newMeasurements, waist: Number(e.target.value) })
                      }
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">Hips</label>
                    <input
                      type="number"
                      value={newMeasurements.hips}
                      onChange={(e) =>
                        setNewMeasurements({ ...newMeasurements, hips: Number(e.target.value) })
                      }
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">Shoulder</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newMeasurements.shoulder}
                      onChange={(e) =>
                        setNewMeasurements({ ...newMeasurements, shoulder: Number(e.target.value) })
                      }
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">Sleeves</label>
                    <input
                      type="number"
                      value={newMeasurements.sleeveLength}
                      onChange={(e) =>
                        setNewMeasurements({ ...newMeasurements, sleeveLength: Number(e.target.value) })
                      }
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1F1F24] mb-1">Trouser Length</label>
                    <input
                      type="number"
                      value={newMeasurements.trouserLength}
                      onChange={(e) =>
                        setNewMeasurements({ ...newMeasurements, trouserLength: Number(e.target.value) })
                      }
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1F1F24] mb-1">Trouser Cut Style</label>
                  <select
                    value={newMeasurements.trouserStyle}
                    onChange={(e) =>
                      setNewMeasurements({
                        ...newMeasurements,
                        trouserStyle: e.target.value as TrouserStyle,
                      })
                    }
                    className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded p-2.5 text-xs text-[#1F1F24]"
                  >
                    {TROUSER_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E2DC]">
                  <button
                    type="button"
                    onClick={() => setShowAddProfileModal(false)}
                    className="px-4 py-2 border border-[#E5E2DC] rounded font-semibold text-[#66666E] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-rani px-6 py-2 rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                  >
                    Save to Sizing Vault
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
