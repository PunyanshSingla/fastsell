"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface StickyAddToCartProps {
  price: number;
  discountPrice?: number;
  onAddToCart: () => void;
  productName: string;
  image?: string;
  isOutOfStock?: boolean;
}

export function StickyAddToCart({
  price,
  discountPrice,
  onAddToCart,
  productName,
  image,
  isOutOfStock = false,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 600px (roughly past the main hero section)
      const shouldShow = window.scrollY > 600;
      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const finalPrice = discountPrice || price;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:border-zinc-800 dark:bg-zinc-900 md:hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
               {image && (
                 <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
                   <img src={image} alt={productName} className="h-full w-full object-cover" />
                 </div>
               )}
              <div className="flex flex-col">
                <span className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-[120px]">
                  {productName}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {formatPrice(finalPrice)}
                  </span>
                  {discountPrice && price > discountPrice && (
                    <span className="text-xs text-zinc-400 line-through">
                      {formatPrice(price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              onClick={onAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex-1 font-bold shadow-lg transition-transform active:scale-95",
                isOutOfStock 
                  ? "bg-zinc-100 text-zinc-400" 
                  : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              )}
            >
              {isOutOfStock ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
