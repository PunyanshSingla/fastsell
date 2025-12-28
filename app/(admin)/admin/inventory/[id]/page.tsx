"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Save, Loader2, Trash2, Info, Tag, Layers, Sparkles, Image as ImageIcon, Eye, Package, Settings, ChevronLeft, Plus, ListPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ImageUploader,
  DeleteButton,
  VariantManager,
  AttributeManager,
  FeatureManager,
} from "@/components/admin";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32 rounded-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[200px] rounded-3xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-[300px] rounded-3xl" />
          <Skeleton className="h-[200px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const [productRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch("/api/admin/categories"),
      ]);

      const productResult = await productRes.json();
      const categoriesResult = await categoriesRes.json();

      if (!productResult.success) throw new Error(productResult.error);

      const p = productResult.product;

      setProduct({
        ...p,
        price: p.price?.toString() ?? "",
        stock: p.stock?.toString() ?? "",
        discountPrice:
          p.discountPrice !== undefined && p.discountPrice !== null
            ? p.discountPrice.toString()
            : "",
        features: p.features || [],
        variants: p.variants?.map((v: any) => ({
          ...v,
          price: v.price?.toString() ?? "",
          stock: v.stock?.toString() ?? "",
          discountPrice:
            v.discountPrice !== undefined && v.discountPrice !== null
              ? v.discountPrice.toString()
              : "",
        })),
      });
      setAvailableCategories(categoriesResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleSave = async () => {
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
      // Sanitize product data before saving
      const payload = {
        ...product,
        price: product.price === "" ? 0 : Number(product.price),
        stock: product.stock === "" ? 0 : Number(product.stock),
        discountPrice:
          product.discountPrice === "" ||
            product.discountPrice === undefined ||
            product.discountPrice === null
            ? undefined
            : Number(product.discountPrice),
        variants: product.variants?.map((v: any) => ({
          ...v,
          price: v.price === "" ? 0 : Number(v.price),
          discountPrice: (v.discountPrice === "" || v.discountPrice === undefined || v.discountPrice === null) ? undefined : Number(v.discountPrice),
          stock: v.stock === "" ? 0 : Number(v.stock),
        })),
      };

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setProduct(result.product);
      toast.success("Product updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setProduct((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) return <ProductDetailSkeleton />;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/inventory"
          className="group flex items-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Inventory
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <DeleteButton productId={id} redirectTo="/admin/inventory" size="icon" className="h-10 w-10 rounded-full" />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-10 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-200 dark:shadow-none"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {product.name || "Untitled Product"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                ID: {id.slice(-6).toUpperCase()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Settings className="h-3.5 w-3.5" />
                Last updated {new Date().toLocaleDateString()}
              </span>
            </div>
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
                    value={product.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Product name"
                    className="h-11 rounded-xl border-zinc-200 bg-zinc-50/30 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/30 dark:focus:bg-zinc-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Slug</Label>
                  <Input
                    id="slug"
                    value={product.slug?.current || ""}
                    onChange={(e) => handleChange("slug", { ...product.slug, current: e.target.value })}
                    placeholder="product-slug"
                    className="h-11 rounded-xl border-zinc-200 bg-zinc-50/30 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-950/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</Label>
                <Select
                  value={product.category?._id || product.category || ""}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-zinc-50/30 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/30 dark:focus:bg-zinc-950">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
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
                  value={product.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Product description..."
                  rows={5}
                  className="rounded-2xl border-zinc-200 bg-zinc-50/30 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950/30 dark:focus:bg-zinc-950 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Attributes Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                  Product Attributes
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs rounded-full"
                onClick={() => {
                  const currentAttrs = product.attributes || [];
                  handleChange("attributes", [...currentAttrs, { name: "", value: "" }]);
                }}
              >
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Detail
              </Button>
            </div>
            <div className="p-6">
              <AttributeManager
                attributes={product.attributes || []}
                onUpdate={(attrs) => handleChange("attributes", attrs)}
              />
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
                  checked={product.hasVariants || false}
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

        {/* Sidebar */}
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
                onUpdate={(updatedProduct) => setProduct(updatedProduct)}
              />
              <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                {product.slug?.current && (
                  <Link
                    href={`/products/${product.slug.current}`}
                    target="_blank"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-50 py-3 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    <Eye className="h-4 w-4" />
                    View on Storefront
                    <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                  </Link>
                )}
              </div>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-orange-400">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                Visibility Settings
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800">
                <div className="space-y-0.5">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Featured Product
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                    Show on homepage
                  </p>
                </div>
                <Switch
                  checked={product.featured || false}
                  onCheckedChange={(checked) => handleChange("featured", checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
