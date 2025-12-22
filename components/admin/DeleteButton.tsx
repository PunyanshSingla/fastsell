"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  productId: string;
  redirectTo?: string;
  onDelete?: () => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function DeleteButton({
  productId,
  redirectTo,
  onDelete,
  size = "sm",
  variant = "destructive",
}: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      "Delete this product permanently? This cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        if (onDelete) {
          onDelete();
        }
        if (redirectTo) {
          router.push(redirectTo);
        }
      } else {
        alert(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("An error occurred while deleting the product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className="gap-1.5"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Delete
    </Button>
  );
}
