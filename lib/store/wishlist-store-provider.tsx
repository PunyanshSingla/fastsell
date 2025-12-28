'use client';

import { type ReactNode, createContext, useRef, useContext, useEffect } from 'react';
import { useStore } from 'zustand';
import { type WishlistStore, createWishlistStore } from '@/lib/store/wishlist-store';
import { useUser } from '@clerk/nextjs';
import { useShallow } from 'zustand/react/shallow';

export type WishlistStoreApi = ReturnType<typeof createWishlistStore>;

export const WishlistStoreContext = createContext<WishlistStoreApi | undefined>(
  undefined,
);

export interface WishlistStoreProviderProps {
  children: ReactNode;
}

export const WishlistStoreProvider = ({
  children,
}: WishlistStoreProviderProps) => {
  const storeRef = useRef<WishlistStoreApi | undefined>(undefined);
  if (!storeRef.current) {
    storeRef.current = createWishlistStore();
  }

  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    if (userId && storeRef.current) {
      storeRef.current.getState().syncWithBackend(userId);
    }
  }, [userId]);

  return (
    <WishlistStoreContext.Provider value={storeRef.current}>
      {children}
    </WishlistStoreContext.Provider>
  );
};

export const useWishlistStore = <T,>(
  selector: (store: WishlistStore) => T,
): T => {
  const wishlistStoreContext = useContext(WishlistStoreContext);

  if (!wishlistStoreContext) {
    throw new Error(`useWishlistStore must be used within WishlistStoreProvider`);
  }

  return useStore(wishlistStoreContext, selector);
};



export const useWishlistActions = () => {
    return useWishlistStore(useShallow((state) => ({
        addItem: state.addItem,
        removeItem: state.removeItem,
        syncWithBackend: state.syncWithBackend
    })));
}

export const useWishlistItems = () => {
    return useWishlistStore((state) => state.items);
}

export const useIsInWishlist = (productId: string) => {
    return useWishlistStore((state) => state.items.some(item => item._id === productId));
}
