"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturedToggleProps {
  product: any;
  onUpdate?: (updatedProduct: any) => void;
}

export function FeaturedToggle({ product, onUpdate }: FeaturedToggleProps) {
  const [isFeatured, setIsFeatured] = useState(product.featured ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    const newValue = !isFeatured;
    setIsFeatured(newValue);
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newValue }),
      });
      const result = await response.json();
      if (result.success && onUpdate) {
        onUpdate(result.product);
      }
    } catch (error) {
      console.error("Failed to toggle featured:", error);
      setIsFeatured(product.featured);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleToggle}
      disabled={isUpdating}
      title={isFeatured ? "Remove from featured" : "Add to featured"}
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
      ) : (
        <Star
          className={cn(
            "h-4 w-4 transition-colors",
            isFeatured
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-300 dark:text-zinc-600"
          )}
        />
      )}
    </Button>
  );
}
