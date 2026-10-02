import { create } from 'zustand';
import { Product } from '@/types';

interface UIState {
  isCartDrawerOpen: boolean;
  isAuthModalOpen: boolean;
  isQuickViewModalOpen: boolean;
  quickViewProductSlug: string | null;
  quickViewProduct: Product | null;
  isSizeChartModalOpen: boolean;
  isSearchModalOpen: boolean;
  isMobileNavOpen: boolean;
  
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openQuickViewModal: (slug: string, product?: Product) => void;
  closeQuickViewModal: () => void;
  openSizeChartModal: () => void;
  closeSizeChartModal: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartDrawerOpen: false,
  isAuthModalOpen: false,
  isQuickViewModalOpen: false,
  quickViewProductSlug: null,
  quickViewProduct: null,
  isSizeChartModalOpen: false,
  isSearchModalOpen: false,
  isMobileNavOpen: false,

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  
  openQuickViewModal: (slug, product) =>
    set({
      isQuickViewModalOpen: true,
      quickViewProductSlug: slug,
      quickViewProduct: product || null,
    }),
  closeQuickViewModal: () =>
    set({
      isQuickViewModalOpen: false,
      quickViewProductSlug: null,
      quickViewProduct: null,
    }),
  
  openSizeChartModal: () => set({ isSizeChartModalOpen: true }),
  closeSizeChartModal: () => set({ isSizeChartModalOpen: false }),
  
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
  
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));
