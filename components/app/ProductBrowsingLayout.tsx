"use client";

import { useTransition, createContext, useContext, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TransitionContextType {
  isPending: boolean;
  startTransition: (callback: () => void) => void;
  navigate: (url: string, slug?: string | null) => void;
  pendingSlug: string | null;
}

const TransitionContext = createContext<TransitionContextType>({
  isPending: false,
  startTransition: () => {},
  navigate: () => {},
  pendingSlug: null,
});

export const useNavigationTransition = () => useContext(TransitionContext);

export function ProductBrowsingLayout({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (url: string, slug: string | null = null) => {
    setPendingSlug(slug);
    startTransition(() => {
      // If the URL is just partial or relative, handle it? 
      // For now, assume it's a full path or just query params
      router.push(url, { scroll: false });
    });
  };

  return (
    <TransitionContext.Provider value={{ isPending, startTransition, navigate, pendingSlug }}>
      <div className={isPending ? "cursor-wait" : ""}>
        {children}
      </div>
    </TransitionContext.Provider>
  );
}
