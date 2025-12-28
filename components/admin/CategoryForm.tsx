
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import {ImageUploader} from "@/components/admin/ImageUploader";
import { toast } from "sonner";

interface CategoryFormProps {
  initialData?: any;
  onSuccess: () => void;
  onClose: () => void;
}

export default function CategoryForm({
  initialData,
  onSuccess,
  onClose,
}: CategoryFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [image, setImage] = useState(initialData?.image || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSlug(initialData.slug);
      setImage(initialData.image);
    }
  }, [initialData]);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (!initialData) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData
        ? `/api/admin/categories/${initialData._id}`
        : "/api/admin/categories";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          image,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Something went wrong");
      }

      toast.success(
        initialData ? "Category updated successfully" : "Category created successfully"
      );
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Category Title (e.g. Living Room)"
            required
            className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="category-slug"
            required
            className="rounded-xl border-zinc-200 dark:border-zinc-800 font-mono text-sm bg-zinc-50 dark:bg-zinc-900/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category Image</Label>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50/30 dark:bg-zinc-900/30 overflow-hidden">
            <ImageUploader
              value={image ? [image] : []}
              onChange={(images: any) => setImage(images[0] || null)}
              maxFiles={1}
            />
          </div>
        </div>
      </div>
      <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-8">
        <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full sm:w-auto rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10 dark:shadow-none transition-all active:scale-95"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </div>
          ) : initialData ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
