import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      toggleWishlist: (productId: string) => {
        const { wishlistIds } = get();
        if (wishlistIds.includes(productId)) {
          set({ wishlistIds: wishlistIds.filter((id) => id !== productId) });
        } else {
          set({ wishlistIds: [...wishlistIds, productId] });
        }
      },
      isInWishlist: (productId: string) => {
        return get().wishlistIds.includes(productId);
      },
      clearWishlist: () => set({ wishlistIds: [] }),
    }),
    {
      name: 'miss-stitch-wishlist',
    }
  )
);
