import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

export const FREE_SHIPPING_THRESHOLD_PKR = 4999;
export const STANDARD_SHIPPING_FEE_PKR = 250;

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discountPKR: number;
  specialOrderNote: string;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  setSpecialOrderNote: (note: string) => void;
  clearCart: () => void;
  
  // Computations
  getItemCount: () => number;
  getSubtotalPKR: () => number;
  getStitchingTotalPKR: () => number;
  getAddonsTotalPKR: () => number;
  getShippingFeePKR: () => number;
  getTotalPKR: () => number;
  getFreeShippingProgress: () => { progressPercentage: number; remainingPKR: number; isFree: boolean };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discountPKR: 0,
      specialOrderNote: '',

      addItem: (newItem) => {
        const id = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        set((state) => {
          // Check if identical unstitched product exists to merge quantity
          if (newItem.stitchingMode === 'unstitched' && !newItem.addons.attachedLining && !newItem.addons.edgeFinishingTassels) {
            const existingIndex = state.items.findIndex(
              (i) => i.productId === newItem.productId && i.stitchingMode === 'unstitched'
            );
            if (existingIndex > -1) {
              const updatedItems = [...state.items];
              updatedItems[existingIndex].quantity += newItem.quantity;
              return { items: updatedItems };
            }
          }
          return { items: [...state.items, { ...newItem, id }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      applyPromoCode: (code) => {
        const normalized = code.trim().toUpperCase();
        const subtotal = get().getSubtotalPKR();
        if (normalized === 'FESTIVE10') {
          const discount = Math.round(subtotal * 0.1);
          set({ promoCode: 'FESTIVE10', discountPKR: discount });
          return true;
        } else if (normalized === 'SILAI500') {
          set({ promoCode: 'SILAI500', discountPKR: 500 });
          return true;
        }
        return false;
      },

      removePromoCode: () => {
        set({ promoCode: null, discountPKR: 0 });
      },

      setSpecialOrderNote: (note) => set({ specialOrderNote: note }),

      clearCart: () => set({ items: [], promoCode: null, discountPKR: 0, specialOrderNote: '' }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotalPKR: () => {
        return get().items.reduce((total, item) => total + (item.basePricePKR * item.quantity), 0);
      },

      getStitchingTotalPKR: () => {
        return get().items.reduce((total, item) => total + (item.stitchingFeePKR * item.quantity), 0);
      },

      getAddonsTotalPKR: () => {
        return get().items.reduce((total, item) => total + (item.addonsFeePKR * item.quantity), 0);
      },

      getShippingFeePKR: () => {
        const subtotal = get().getSubtotalPKR();
        if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_PKR) {
          return 0;
        }
        return STANDARD_SHIPPING_FEE_PKR;
      },

      getTotalPKR: () => {
        const subtotal = get().getSubtotalPKR();
        const stitching = get().getStitchingTotalPKR();
        const addons = get().getAddonsTotalPKR();
        const shipping = get().getShippingFeePKR();
        const discount = get().discountPKR;
        const total = subtotal + stitching + addons + shipping - discount;
        return Math.max(0, total);
      },

      getFreeShippingProgress: () => {
        const subtotal = get().getSubtotalPKR();
        if (subtotal >= FREE_SHIPPING_THRESHOLD_PKR) {
          return { progressPercentage: 100, remainingPKR: 0, isFree: true };
        }
        const remaining = FREE_SHIPPING_THRESHOLD_PKR - subtotal;
        const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_PKR) * 100));
        return { progressPercentage: percentage, remainingPKR: remaining, isFree: false };
      },
    }),
    {
      name: 'miss-stitch-cart',
    }
  )
);
