import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/types';

export type WishlistState = {
  items: Product[];
  isLoading: boolean;
};

export type WishlistActions = {
  addItem: (product: Product, userId?: string | null) => Promise<void>;
  removeItem: (productId: string, userId?: string | null) => Promise<void>;
  setItems: (items: Product[]) => void;
  syncWithBackend: (userId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
};

export type WishlistStore = WishlistState & WishlistActions;

export const createWishlistStore = (
  initState: WishlistState = { items: [], isLoading: false }
) => {
  return createStore<WishlistStore>()(
    persist(
      (set, get) => ({
        ...initState,
        addItem: async (product, userId) => {
          // Optimistic update
          set((state) => {
            if (state.items.some((item) => item._id === product._id)) return state;
            return { items: [...state.items, product] };
          });

          if (userId) {
            try {
              await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product._id }),
              });
            } catch (error) {
              console.error('Failed to add to wishlist backend', error);
              // Revert on failure could be implemented here
            }
          }
        },
        removeItem: async (productId, userId) => {
           // Optimistic update
          set((state) => ({
            items: state.items.filter((item) => item._id !== productId),
          }));

          if (userId) {
            try {
              await fetch('/api/wishlist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
              });
            } catch (error) {
              console.error('Failed to remove from wishlist backend', error);
            }
          }
        },
        setItems: (items) => set({ items }),
        syncWithBackend: async (userId) => {
          if (!userId) return;
          set({ isLoading: true });
          try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
              const data = await res.json();
              // Merge local and backend items logic could go here, 
              // but for now we'll just trust the backend as source of truth when logged in
              if (data.wishlist) {
                 set({ items: data.wishlist });
              }
            }
          } catch (error) {
            console.error('Failed to sync wishlist', error);
          } finally {
            set({ isLoading: false });
          }
        },
        isInWishlist: (productId) => {
            return get().items.some(item => item._id === productId);
        }
      }),
      {
        name: 'wishlist-storage',
      }
    )
  );
};
