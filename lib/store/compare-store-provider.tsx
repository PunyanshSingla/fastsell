"use client";

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import {
  createCompareStore,
  type CompareStore,
  type CompareState,
  defaultInitState,
  MAX_COMPARE_ITEMS,
} from "./compare-store";

// Store API type
export type CompareStoreApi = ReturnType<typeof createCompareStore>;

// Context
const CompareStoreContext = createContext<CompareStoreApi | undefined>(undefined);

// Provider props
interface CompareStoreProviderProps {
  children: ReactNode;
  initialState?: CompareState;
}

/**
 * Compare store provider - creates one store instance per provider
 * Manually triggers rehydration from localStorage on the client
 */
export const CompareStoreProvider = ({
  children,
  initialState,
}: CompareStoreProviderProps) => {
  const storeRef = useRef<CompareStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createCompareStore(initialState ?? defaultInitState);
  }

  // Manually trigger rehydration on the client after mount
  useEffect(() => {
    storeRef.current?.persist.rehydrate();
  }, []);

  return (
    <CompareStoreContext.Provider value={storeRef.current}>
      {children}
    </CompareStoreContext.Provider>
  );
};

/**
 * Hook to access the compare store with a selector
 */
export const useCompareStore = <T,>(selector: (store: CompareStore) => T): T => {
  const compareStoreContext = useContext(CompareStoreContext);

  if (!compareStoreContext) {
    throw new Error("useCompareStore must be used within CompareStoreProvider");
  }

  return useStore(compareStoreContext, selector);
};

// ============================================
// Convenience Hooks
// ============================================

/**
 * Get all comparison items
 */
export const useCompareItems = () => useCompareStore((state) => state.items);

/**
 * Get the number of items in comparison
 */
export const useCompareCount = () => useCompareStore((state) => state.items.length);

/**
 * Check if comparison is at max capacity
 */
export const useIsCompareMaxed = () => 
  useCompareStore((state) => state.items.length >= MAX_COMPARE_ITEMS);

/**
 * Check if a product is in comparison
 */
export const useIsInCompare = (productId: string) =>
  useCompareStore((state) => state.items.some((item) => item._id === productId));

/**
 * Get all compare actions
 */
export const useCompareActions = () => {
  const addProduct = useCompareStore((state) => state.addProduct);
  const removeProduct = useCompareStore((state) => state.removeProduct);
  const clearAll = useCompareStore((state) => state.clearAll);
  const isInComparison = useCompareStore((state) => state.isInComparison);

  return {
    addProduct,
    removeProduct,
    clearAll,
    isInComparison,
  };
};

// Re-export the max limit for use in components
export { MAX_COMPARE_ITEMS };
