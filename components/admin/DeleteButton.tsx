"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface DeleteButtonProps {
  productId: string;
  redirectTo?: string;
  onDelete?: () => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export function DeleteButton({
  productId,
  redirectTo,
  onDelete,
  size = "sm",
  variant = "destructive",
  className,
}: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success("Product deleted successfully");
      
      if (onDelete) {
        onDelete();
      }
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error: any) {
      toast.error("Failed to delete product", {
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("rounded-xl transition-all", size !== "icon" && "gap-2 px-4", className)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin font-bold" />
          ) : (
            <Trash2 className={cn(size === "icon" ? "h-5 w-5" : "h-4 w-4")} />
          )}
          {size !== "icon" && "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        <AlertDialogHeader className="relative z-10">
          <AlertDialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
            This action is irreversible. The product data will be permanently removed from your catalog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="relative z-10 mt-6">
          <AlertDialogCancel className="rounded-2xl border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 px-8"
          >
            Delete Product
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
