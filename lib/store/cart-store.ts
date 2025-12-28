import { createStore } from "zustand/vanilla";
import { persist } from "zustand/middleware";

// Types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    sku: string;
    size?: string;
    color?: string;
    variantName?: string;
  };
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantSku?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantSku?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export type CartStore = CartState & CartActions;

// Default state
export const defaultInitState: CartState = {
  items: [],
  isOpen: false,
};

/**
 * Cart store factory - creates new store instance per provider
 * Uses persist middleware with skipHydration for Next.js SSR compatibility
 * @see https://zustand.docs.pmnd.rs/guides/nextjs#hydration-and-asynchronous-storages
 */
export const createCartStore = (initState: CartState = defaultInitState) => {
  return createStore<CartStore>()(
    persist(
      (set) => ({
        ...initState,

        addItem: (item, quantity = 1) =>
          set((state) => {
            const existing = state.items.find(
              (i) => i.productId === item.productId && i.variant?.sku === item.variant?.sku
            );
            if (existing) {
              return {
                items: state.items.map((i) =>
                  (i.productId === item.productId && i.variant?.sku === item.variant?.sku)
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity }] };
          }),

        removeItem: (productId, variantSku) =>
          set((state) => ({
            items: state.items.filter((i) => 
              !(i.productId === productId && i.variant?.sku === variantSku)
            ),
          })),

        updateQuantity: (productId, quantity, variantSku) =>
          set((state) => {
            if (quantity <= 0) {
              return {
                items: state.items.filter((i) => 
                  !(i.productId === productId && i.variant?.sku === variantSku)
                ),
              };
            }
            return {
              items: state.items.map((i) =>
                (i.productId === productId && i.variant?.sku === variantSku) ? { ...i, quantity } : i
              ),
            };
          }),

        clearCart: () => set({ items: [] }),
        toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
        openCart: () => set({ isOpen: true }),
        closeCart: () => set({ isOpen: false }),
      }),
      {
        name: "cart-storage",
        // Skip automatic hydration - we'll trigger it manually on the client
        skipHydration: true,
        // Only persist items, not UI state like isOpen
        partialize: (state) => ({ items: state.items }),
      }
    )
  );
};
