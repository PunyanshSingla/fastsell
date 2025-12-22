"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin";
import { toast } from "sonner";

const MATERIALS = [
  { value: "wood", label: "Wood" },
  { value: "metal", label: "Metal" },
  { value: "fabric", label: "Fabric" },
  { value: "leather", label: "Leather" },
  { value: "glass", label: "Glass" },
];

const COLORS = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "oak", label: "Oak" },
  { value: "walnut", label: "Walnut" },
  { value: "grey", label: "Grey" },
  { value: "natural", label: "Natural" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [product, setProduct] = useState<any>({
    name: "",
    slug: { current: "" },
    description: "",
    price: 0,
    stock: 0,
    material: "wood",
    color: "black",
    dimensions: "",
    featured: false,
    assemblyRequired: false,
    images: [],
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!product.name || !product.slug.current) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      toast.success("Product created successfully");
      router.push(`/admin/inventory/${result.product._id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setProduct((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    setProduct((prev: any) => ({
      ...prev,
      name,
      slug: { ...prev.slug, current: slug },
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href="/admin/inventory"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Inventory
      </Link>

      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              New Product
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Create a new product listing
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Create Product
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={product.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={product.slug.current}
                    onChange={(e) => handleChange("slug", { ...product.slug, current: e.target.value })}
                    placeholder="product-slug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={product.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Product description..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
                Pricing & Inventory
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.price || ""}
                    onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
                Product Images
              </h2>
              <ImageUploader 
                product={product} 
                onUpdate={(upd) => setProduct(upd)} 
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
                Options
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Featured</Label>
                  <Switch
                    checked={product.featured}
                    onCheckedChange={(c) => handleChange("featured", c)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Assembly Required</Label>
                  <Switch
                    checked={product.assemblyRequired}
                    onCheckedChange={(c) => handleChange("assemblyRequired", c)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
