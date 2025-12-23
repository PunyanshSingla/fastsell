"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatActions } from "@/lib/store/chat-store-provider";

interface AskAISimilarButtonProps {
  productName: string;
}

export function AskAISimilarButton({ productName }: AskAISimilarButtonProps) {
  const { openChatWithMessage } = useChatActions();

  const handleClick = () => {
    openChatWithMessage(`Show me products similar to "${productName}"`);
  };

  return (
    <Button
      onClick={handleClick}
      className="h-11 w-70 gap-2 bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-md transition-all hover:scale-[1.01] hover:from-amber-600 hover:to-orange-700 hover:shadow-lg active:scale-[0.98] dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800"
    >
      <Sparkles className="h-4 w-4" />
      Ask AI for similar products
    </Button>
  );
}
