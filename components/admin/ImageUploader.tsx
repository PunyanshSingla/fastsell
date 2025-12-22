"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  X,
  ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  product: any;
  onUpdate: (updatedProduct: any) => void;
}

export function ImageUploader({ product, onUpdate }: ImageUploaderProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const currentImages = product?.images ?? [];

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;

    const newImage = {
      _key: crypto.randomUUID(),
      _type: "image",
      asset: {
        url: newImageUrl.trim(),
      },
    };

    const updatedImages = [...currentImages, newImage];
    onUpdate({ ...product, images: updatedImages });
    setNewImageUrl("");
  };

  const handleRemoveImage = (keyToRemove: string) => {
    const updatedImages = currentImages.filter(
      (img: any) => img._key !== keyToRemove
    );
    onUpdate({ ...product, images: updatedImages });
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentImages.length) return;

    const updatedImages = [...currentImages];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    onUpdate({ ...product, images: updatedImages });
  };

  return (
    <div className="space-y-4">
      {/* Upload/Add URL */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter image URL..."
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
        />
        <Button type="button" onClick={handleAddImage} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Grid */}
      {currentImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {currentImages.map((image: any, index: number) => (
            <div
              key={image._key || index}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800",
                index === 0 && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900"
              )}
            >
              <Image
                src={image.asset?.url || "/placeholder.png"}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />

              {index === 0 && (
                <div className="absolute left-2 top-2 rounded bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white">
                  Main
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMoveImage(index, index - 1)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleMoveImage(index, index + 1)}
                    disabled={index === currentImages.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemoveImage(image._key)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-8 dark:border-zinc-700">
          <ImageIcon className="mb-2 h-10 w-10 text-zinc-400" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No images added
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Enter a URL above to add product images
          </p>
        </div>
      )}

      {currentImages.length > 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          First image is the main product image. Reorder to change.
        </p>
      )}
    </div>
  );
}
