"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Link2, 
  Check,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  productName: string;
  productSlug: string;
  className?: string;
}

export function ShareButton({ productName, productSlug, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // Check for native share support on client
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Generate the product URL
  const getProductUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/products/${productSlug}`;
    }
    return `/products/${productSlug}`;
  };

  const shareText = `Check out ${productName}!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(getProductUrl());
    const text = encodeURIComponent(shareText);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
      setIsOpen(false);
    }
  };

  // Try native share API on mobile
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: getProductUrl(),
        });
        setIsOpen(false);
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      onClick: () => handleShare("facebook"),
      color: "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400",
    },
    {
      name: "Twitter",
      icon: Twitter,
      onClick: () => handleShare("twitter"),
      color: "hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950 dark:hover:text-sky-400",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      onClick: () => handleShare("whatsapp"),
      color: "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400",
    },
    {
      name: copied ? "Copied!" : "Copy Link",
      icon: copied ? Check : Link2,
      onClick: handleCopyLink,
      color: copied 
        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" 
        : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
    },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-12 w-12 shrink-0 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800",
            className
          )}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 pb-2">
            Share this product
          </p>
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.onClick}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors",
                option.color
              )}
            >
              <option.icon className="h-4 w-4" />
              {option.name}
            </button>
          ))}
          
          {/* Native share for mobile */}
          {canNativeShare && (
            <>
              <div className="border-t border-zinc-100 dark:border-zinc-800 my-2" />
              <button
                onClick={handleNativeShare}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                More options...
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

