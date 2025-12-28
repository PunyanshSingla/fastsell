"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Package, Tag, Info, Image as ImageIcon, Sparkles, Settings, ListPlus } from "lucide-react";
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
import { ImageUploader, VariantManager, FeatureManager } from "@/components/admin";
import { toast } from "sonner";

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
    hasVariants: false,
    variants: [],
    images: [],
    category: "",
    features: [],
  });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!product.name || !product.slug.current) {
      toast.error("Name and slug are required");
      return;
    }

    // Validate Variants
    if (product.hasVariants && product.variants?.length > 0) {
      for (const variant of product.variants) {
        if (variant.attributes?.some((attr: any) => !attr.value)) {
            toast.error("Please fill in all variant options (e.g. Size, Color)");
            return;
        }
      }
    }
    
    // Validate Attributes (Product Details)
    if (product.attributes?.length > 0) {
       if (product.attributes.some((attr: any) => !attr.name || !attr.value)) {
           toast.error("Please fill in all product details (name and value)");
           return;
       }
    }

    setSaving(true);
    try {
      // Sanitize product      // Create payload
      const payload = {
        ...product,
        price: product.price === "" ? 0 : Number(product.price),
        stock: product.stock === "" ? 0 : Number(product.stock),
        discountPrice: (product.discountPrice === "" || product.discountPrice === undefined || product.discountPrice === null) ? undefined : Number(product.discountPrice),
        variants: product.variants?.map((v: any) => ({
          ...v,
          price: v.price === "" ? 0 : Number(v.price),
          discountPrice: (v.discountPrice === "" || v.discountPrice === undefined || v.discountPrice === null) ? undefined : Number(v.discountPrice),
          stock: v.stock === "" ? 0 : Number(v.stock),
        })),
      };

      const response = await fetch(`/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/inventory"
          className="group flex items-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Inventory
        </Link>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="h-10 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Create Product
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              New Product
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Fill in the details below to create your new product listing.
            </p>
          </div>

          {/* Basic Info Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Info className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Name</Label>
                  <Input
                    id="name"
                    value={product.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Minimalist Oak Table"
                    className="h-11 rounded-xl border-zinc-200 bg-zinc-50/30 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/30 dark:focus:bg-zinc-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Slug</Label>
                  <Input
                    id="slug"
                    value={product.slug.current}
                    onChange={(e) => handleChange("slug", { ...product.slug, current: e.target.value })}
                    placeholder="minimalist-oak-table"
                    className="h-11 rounded-xl border-zinc-200 bg-zinc-50/30 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</Label>
                <Select
                  value={product.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-zinc-50/30 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/30 dark:focus:bg-zinc-950">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</Label>
                <Textarea
                  id="description"
                  value={product.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Tell your customers about this product..."
                  rows={5}
                  className="rounded-2xl border-zinc-200 bg-zinc-50/30 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/30 dark:focus:bg-zinc-950 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Tag className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                  Pricing & Inventory
                </h2>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
                <Label htmlFor="hasVariants" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Has Variants</Label>
                <Switch
                  id="hasVariants"
                  checked={product.hasVariants}
                  onCheckedChange={(c) => handleChange("hasVariants", c)}
                />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Base Price (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      placeholder="0.00"
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 pl-8 text-lg font-bold dark:border-zinc-800 dark:bg-zinc-950/30"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Discount Price (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.discountPrice ?? ""}
                      onChange={(e) => handleChange("discountPrice", e.target.value)}
                      placeholder="Optional"
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 pl-8 text-lg font-bold dark:border-zinc-800 dark:bg-zinc-950/30"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  placeholder="0"
                  className="h-12 rounded-xl border-zinc-200 bg-zinc-50/30 text-lg font-bold dark:border-zinc-800 dark:bg-zinc-950/30"
                />
              </div>

              {product.hasVariants && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <VariantManager
                    variants={product.variants || []}
                    onUpdate={(variants) => handleChange("variants", variants)}
                    basePrice={Number(product.price) || 0}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Images Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                <ImageIcon className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                Product Images
              </h2>
            </div>
            <div className="p-6">
              <ImageUploader 
                product={product} 
                onUpdate={(upd) => setProduct(upd)} 
              />
            </div>
          </div>

          {/* Features Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <ListPlus className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                Product Features
              </h2>
            </div>
            <div className="p-6">
              <FeatureManager
                features={product.features || []}
                onUpdate={(features) => handleChange("features", features)}
              />
            </div>
          </div>

          {/* Visibility & Options Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                Visibility Settings
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Featured Product</Label>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Show on home page</p>
                </div>
                <Switch
                  checked={product.featured}
                  onCheckedChange={(c) => handleChange("featured", c)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
