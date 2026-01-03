import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

// Maximum number of products that can be compared at once
export const MAX_COMPARE_ITEMS = 4;

// Types
export interface CompareState {
  items: Product[];
}

export interface CompareActions {
  addProduct: (product: Product) => boolean;
  removeProduct: (productId: string) => void;
  clearAll: () => void;
  isInComparison: (productId: string) => boolean;
}

export type CompareStore = CompareState & CompareActions;

// Default state
export const defaultInitState: CompareState = {
  items: [],
};

/**
 * Compare store factory - creates new store instance per provider
 * Uses persist middleware with skipHydration for Next.js SSR compatibility
 */
export const createCompareStore = (initState: CompareState = defaultInitState) => {
  return createStore<CompareStore>()(
    persist(
      (set, get) => ({
        ...initState,

        addProduct: (product) => {
          const state = get();
          // Check if already in comparison
          if (state.items.some((item) => item._id === product._id)) {
            return false;
          }
          // Check if max limit reached
          if (state.items.length >= MAX_COMPARE_ITEMS) {
            return false;
          }
          set({ items: [...state.items, product] });
          return true;
        },

        removeProduct: (productId) =>
          set((state) => ({
            items: state.items.filter((item) => item._id !== productId),
          })),

        clearAll: () => set({ items: [] }),

        isInComparison: (productId) => {
          return get().items.some((item) => item._id === productId);
        },
      }),
      {
        name: "compare-storage",
        // Skip automatic hydration - we'll trigger it manually on the client
        skipHydration: true,
      }
    )
  );
};
