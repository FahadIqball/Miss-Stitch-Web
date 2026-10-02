'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sparkles,
  Scissors,
  Truck,
  Compass,
} from 'lucide-react';

const NAV_LINKS = [
  { name: 'New In', href: '/shop?filter=new', highlight: true },
  { name: 'Unstitched 3-Pc', href: '/shop?category=unstitched' },
  { name: 'Ready to Wear', href: '/shop?category=ready-to-wear' },
  { name: 'Festive Luxury', href: '/shop?category=festive' },
  { name: 'Velvet Formals', href: '/shop?category=velvet' },
  { name: 'Digital Silai Atelier', href: '/custom-stitching', badge: 'Bespoke' },
  { name: 'Sale', href: '/shop?filter=sale', isSale: true },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const { wishlistIds } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();
  const {
    openCartDrawer,
    openAuthModal,
    openSearchModal,
    isMobileNavOpen,
    openMobileNav,
    closeMobileNav,
  } = useUIStore();

  const cartCount = getItemCount();
  const wishlistCount = wishlistIds.length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-none border-b border-[#E5E2DC] shadow-xs">
        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile Menu Toggle & Track Order Shortcut */}
            <div className="flex items-center gap-4 lg:hidden">
              <button
                type="button"
                onClick={openMobileNav}
                className="p-2 text-[#1F1F24] hover:text-[#E61A6B] transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={openSearchModal}
                className="p-2 text-[#1F1F24] hover:text-[#E61A6B] transition-colors"
                aria-label="Search collection"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Left Desktop: Quick Links */}
            <div className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-[#66666E]">
              <Link
                href="/track-order"
                className="flex items-center gap-1.5 hover:text-[#E61A6B] transition-colors"
              >
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Track Parcel</span>
              </Link>
              <Link
                href="/custom-stitching"
                className="flex items-center gap-1.5 hover:text-[#E61A6B] transition-colors"
              >
                <Scissors className="w-4 h-4 text-[#E61A6B]" />
                <span>Silai Guide</span>
              </Link>
            </div>

            {/* Center: Brand Logo with Golden Needle Monogram */}
            <div className="flex-1 flex justify-center text-center">
              <Link href="/" className="inline-flex flex-col items-center group py-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1F1F24] text-[#D4AF37] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1F24] group-hover:text-[#E61A6B] transition-colors">
                    Miss Stitch
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#66666E] font-medium -mt-0.5">
                  Haute Couture & Bespoke Silai
                </span>
              </Link>
            </div>

            {/* Right: Actions (Search, Wishlist, Account, Cart) */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Search */}
              <button
                type="button"
                onClick={openSearchModal}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF] border border-[#E5E2DC] rounded text-xs text-[#66666E] hover:border-[#D4AF37] hover:text-[#1F1F24] transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search lawn, chiffon, pret...</span>
                <kbd className="text-[10px] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5E2DC] text-[#66666E]">
                  Ctrl+K
                </kbd>
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2 text-[#1F1F24] hover:text-[#E61A6B] transition-colors"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#E61A6B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account / Auth Modal */}
              <button
                type="button"
                onClick={isAuthenticated ? () => window.location.href = '/account' : openAuthModal}
                className="p-2 text-[#1F1F24] hover:text-[#E61A6B] transition-colors flex items-center gap-1"
                aria-label="Customer Account"
              >
                <User className="w-5 h-5" />
                {isAuthenticated && (
                  <span className="hidden xl:inline text-xs font-semibold text-[#1F1F24] max-w-[80px] truncate">
                    {user?.name?.split(' ')[0] || 'Profile'}
                  </span>
                )}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCartDrawer}
                className="relative flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] border border-[#D4AF37] rounded hover:bg-[#FAF5E6] transition-all group"
                aria-label={`Shopping Cart with ${cartCount} items`}
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-[#1F1F24] group-hover:text-[#E61A6B] transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#E61A6B] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-[#1F1F24]">
                  Bag
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Categories Menu Bar */}
          <nav className="hidden lg:flex items-center justify-center gap-8 py-2.5 border-t border-[#E5E2DC]/70">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs uppercase tracking-widest font-semibold py-1 transition-all relative flex items-center gap-1.5 group ${
                    link.isSale
                      ? 'text-[#E61A6B] hover:text-[#CF145E] font-bold'
                      : link.highlight
                      ? 'text-[#1F1F24] hover:text-[#E61A6B]'
                      : isActive
                      ? 'text-[#E61A6B] font-bold'
                      : 'text-[#1F1F24] hover:text-[#E61A6B]'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="bg-[#0A5C36] text-white text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-normal">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E61A6B]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={closeMobileNav}
          />

          {/* Content Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF8F5] shadow-xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-4 border-b border-[#E5E2DC] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#D4AF37]" />
                <span className="font-serif text-lg font-bold text-[#1F1F24]">Miss Stitch</span>
              </div>
              <button
                type="button"
                onClick={closeMobileNav}
                className="p-1 text-[#66666E] hover:text-[#1F1F24]"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links List */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileNav}
                  className="flex items-center justify-between py-3 px-3 rounded text-sm font-semibold uppercase tracking-wider text-[#1F1F24] hover:bg-white hover:text-[#E61A6B] transition-colors"
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="bg-[#0A5C36] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-[#E5E2DC] space-y-2">
                <Link
                  href="/track-order"
                  onClick={closeMobileNav}
                  className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-[#66666E] hover:text-[#1F1F24]"
                >
                  <Truck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Track My Parcel</span>
                </Link>
                <Link
                  href="/account"
                  onClick={closeMobileNav}
                  className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-[#66666E] hover:text-[#1F1F24]"
                >
                  <User className="w-4 h-4 text-[#E61A6B]" />
                  <span>My Sizing Vault & Profile</span>
                </Link>
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-[#E5E2DC] bg-white text-xs text-[#66666E]">
              <p className="font-semibold text-[#1F1F24] mb-1">WhatsApp Customer Service</p>
              <p>Mon - Sat: 10:00 AM - 8:00 PM PKT</p>
              <a
                href="https://wa.me/923000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center py-2 bg-[#0A5C36] text-white font-bold rounded"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
