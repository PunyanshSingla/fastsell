"use client";

import Link from "next/link";
import { Package, ShoppingBag, Sparkles, User, Heart } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useCartActions, useTotalItems } from "@/lib/store/cart-store-provider";
import { useChatActions, useIsChatOpen } from "@/lib/store/chat-store-provider";
import { useWishlistItems } from "@/lib/store/wishlist-store-provider";

export function Header() {
  const { openCart } = useCartActions();
  const { openChat } = useChatActions();
  const isChatOpen = useIsChatOpen();
  const totalItems = useTotalItems();
  const wishlistItems = useWishlistItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-base sm:text-lg lg:text-xl">
          <Package className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
          <span className="hidden xs:inline">The Furniture Store</span>
          <span className="xs:hidden">TFS</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* My Orders - Only when signed in */}
          <SignedIn>
            <Button variant="ghost" size="sm" asChild className="h-8 sm:h-9 px-2 sm:px-3">
              <Link href="/orders" className="flex items-center gap-1.5 sm:gap-2">
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline text-sm">My Orders</span>
              </Link>
            </Button>
          </SignedIn>

          {/* Wishlist Button */}
          <Button variant="outline" size="sm" asChild className="relative h-8 sm:h-9 px-2 sm:px-3">
            <Link href="/wishlist" className="flex items-center gap-1.5 sm:gap-2">
              <Heart className="h-4 w-4 shrink-0" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs text-primary-foreground font-medium">
                  {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
                </span>
              )}
            </Link>
          </Button>

          {/* Cart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={openCart}
            className="relative h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1.5"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[10px] sm:text-xs text-primary-foreground font-medium">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
            <span className="sr-only">
              Open cart ({totalItems} items)
            </span>
          </Button>

          {/* User */}
          <SignedIn>
            <div className="ml-1">
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <Button variant="ghost" size="sm" asChild className="h-8 sm:h-9 px-2 sm:px-3">
              <SignInButton>
                <button className="flex items-center gap-1.5 sm:gap-2">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline text-sm">Sign in</span>
                </button>
              </SignInButton>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
