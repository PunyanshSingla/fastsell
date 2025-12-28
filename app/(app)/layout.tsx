"use client";

import { CartStoreProvider } from "@/lib/store/cart-store-provider";
import { WishlistStoreProvider } from "@/lib/store/wishlist-store-provider";
import { ChatStoreProvider } from "@/lib/store/chat-store-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/app/Header";
import { CartSheet } from "@/components/app/CartSheet";
import { AppShell } from "@/components/app/AppShell";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <CartStoreProvider>
        <WishlistStoreProvider>
          <ChatStoreProvider>
            <AppShell>
              <Header />
              <main>{children}</main>
            </AppShell>
            <CartSheet />
            <Toaster position="bottom-center" />
          </ChatStoreProvider>
        </WishlistStoreProvider>
      </CartStoreProvider>
    </ClerkProvider>
  );
}

export default AppLayout;
