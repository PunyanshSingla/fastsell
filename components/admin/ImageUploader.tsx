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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";



export function ImageUploader({ 
  product, 
  onUpdate,
  value,
  onChange,
  maxFiles 
}: { 
  product?: any; 
  onUpdate?: (updated: any) => void;
  value?: any[];
  onChange?: (images: any[]) => void;
  maxFiles?: number;
}) {
  const [newImageUrl, setNewImageUrl] = useState("");
  // Determine source of truth
  const images = value || product?.images || [];

  const [isUploading, setIsUploading] = useState(false);

  const handleImagesUpdate = (newImages: any[]) => {
    if (onChange) {
      onChange(newImages);
    } else if (onUpdate && product) {
      onUpdate({ ...product, images: newImages });
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;

    if (!newImageUrl.startsWith("http")) {
      toast.error("Invalid image URL");
      return;
    }

    if (maxFiles && images.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const newImage = {
       _key: crypto.randomUUID(),
       asset: { url: newImageUrl.trim() },
    };

    handleImagesUpdate([...images, newImage]);
    setNewImageUrl("");
    toast.success("Image added");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (maxFiles && images.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Check Cloudinary config
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary not configured. Check environment variables.");
      console.error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      const newImage = {
        _key: crypto.randomUUID(),
        asset: { url: data.secure_url },
      };

      handleImagesUpdate([...images, newImage]);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    handleImagesUpdate(updated);
  };

  const removeImage = (key: string) => {
    handleImagesUpdate(images.filter((img: any) => img._key !== key));
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="flex flex-col gap-3">
        {/* URL Input */}
        <div className="relative">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste image URL or upload file"
            className="h-11 pl-9 rounded-xl w-full"
            onKeyDown={(e) => e.key === "Enter" && addImage()}
            disabled={isUploading || (maxFiles ? images.length >= maxFiles : false)}
          />
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
            <Button
                onClick={addImage}
                className="h-11 flex-1 rounded-xl"
                disabled={!newImageUrl || isUploading || (maxFiles ? images.length >= maxFiles : false)}
            >
                <Plus className="h-4 w-4 mr-2" />
                Add URL
            </Button>
            <div className="relative flex-1">
                <Button
                    className="h-11 w-full rounded-xl relative"
                    variant="secondary"
                    disabled={isUploading || (maxFiles ? images.length >= maxFiles : false)}
                >
                    {isUploading ? (
                        <span className="animate-pulse">Uploading...</span>
                    ) : (
                        <>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Upload
                        </>
                    )}
                </Button>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading || (maxFiles ? images.length >= maxFiles : false)}
                />
            </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {images.length > 0 ? (
          <div className="space-y-4">
            {/* Primary Image */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {maxFiles === 1 ? "Image" : "Primary Image"}
              </span>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="group relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="absolute inset-0 p-4">
                    <Image
                    src={images[0].asset?.url}
                    alt="Primary image"
                    fill
                    className="object-contain"
                    priority
                    />
                </div>
                
                {/* Controls Overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded-lg backdrop-blur-sm">
                   {images.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white hover:bg-white/20 hover:text-white"
                        onClick={() => moveImage(0, 1)}
                        title="Move Down"
                        type="button"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                   )}
                   <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-400 hover:bg-white/20 hover:text-red-300"
                      onClick={() => removeImage(images[0]._key)}
                      title="Remove"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                </div>
                {maxFiles !== 1 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] font-bold text-white uppercase backdrop-blur-md">
                      Main Display
                  </div>
                )}
              </motion.div>
            </div>

            {/* Gallery Grid */}
            {images.length > 1 && (
               <div className="space-y-2">
                 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Gallery ({images.length - 1})
                 </span>
                 <div className="grid grid-cols-3 gap-2">
                    {images.slice(1).map((img: any, idx: number) => {
                        // Actual index in the full array is idx + 1
                        const realIndex = idx + 1;
                        return (
                          <motion.div
                            key={img._key}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="group relative aspect-square bg-muted rounded-lg overflow-hidden border hover:border-zinc-400 transition-colors"
                          >
                             <div className="absolute inset-0 p-2">
                                <Image
                                src={img.asset?.url}
                                alt={`Gallery image ${realIndex}`}
                                fill
                                className="object-contain"
                                sizes="33vw"
                                />
                             </div>

                             {/* Thumbnail Controls */}
                             <div className="absolute inset-x-0 bottom-0 p-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-[2px]">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                                  onClick={() => moveImage(realIndex, realIndex - 1)}
                                  title="Move Up (Make Primary)"
                                  type="button"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                {realIndex < images.length - 1 && (
                                   <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                                    onClick={() => moveImage(realIndex, realIndex + 1)}
                                    title="Move Down"
                                    type="button"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-red-400 hover:bg-white/20 hover:text-red-300"
                                  onClick={() => removeImage(img._key)}
                                  title="Remove"
                                  type="button"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                             </div>
                          </motion.div>
                        );
                    })}
                 </div>
               </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl border-zinc-200 dark:border-zinc-800"
          >
            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                 <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No images yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">
              Paste a URL above to add your first product image
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
