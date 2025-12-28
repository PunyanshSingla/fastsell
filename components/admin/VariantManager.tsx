"use client";

import { useState } from "react";
import { Plus, Trash2, Layers, Settings2, GripVertical, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface VariantAttribute {
  name: string;
  value: string;
}

interface Variant {
  _id?: string;
  variantName: string;
  attributes: VariantAttribute[];
  sku: string;
  price: number | string;
  discountPrice?: number | string;
  stock: number | string;
  image?: string;
}

interface VariantManagerProps {
  variants: Variant[];
  onUpdate: (variants: Variant[]) => void;
  basePrice: number;
}

export function VariantManager({ variants = [], onUpdate, basePrice }: VariantManagerProps) {
  const [variantTypes, setVariantTypes] = useState<string[]>(
    variants.length > 0 && variants[0].attributes 
      ? variants[0].attributes.map(a => a.name) 
      : ["Size", "Color"]
  );

  const [newType, setNewType] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addVariantType = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") || !newType.trim()) {
      return;
    }
    
    if (e.type === "keydown") {
      e.preventDefault();
    }

    if (!variantTypes.includes(newType.trim())) {
      const updatedTypes = [...variantTypes, newType.trim()];
      setVariantTypes(updatedTypes);
      onUpdate(variants.map(v => ({
        ...v,
        attributes: [...(v.attributes || []), { name: newType.trim(), value: "" }]
      })));
    }
    setNewType("");
  };

  const removeVariantType = (typeToRemove: string) => {
    const updatedTypes = variantTypes.filter(t => t !== typeToRemove);
    setVariantTypes(updatedTypes);
    onUpdate(variants.map(v => ({
      ...v,
      attributes: (v.attributes || []).filter(a => a.name !== typeToRemove)
    })));
  };

  const addVariant = () => {
    const newVariant: Variant = {
      variantName: "",
      attributes: variantTypes.map(type => ({ name: type, value: "" })),
      sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      price: basePrice,
      stock: 0,
      discountPrice: "", // Default to empty
      image: ""
    };
    onUpdate([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    onUpdate(variants.filter((_, i) => i !== index));
  };

  const updateVariantAttribute = (variantIndex: number, attrName: string, value: string) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];
    if (!variant.attributes) variant.attributes = [];
    
    const attrIndex = variant.attributes.findIndex(a => a.name === attrName);
    if (attrIndex >= 0) {
      variant.attributes[attrIndex].value = value;
    } else {
      variant.attributes.push({ name: attrName, value });
    }
    
    variant.variantName = variant.attributes.map(a => a.value).filter(Boolean).join(" / ");
    onUpdate(newVariants);
  };

  const updateVariantField = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onUpdate(newVariants);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check Cloudinary config
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary not configured");
      return;
    }

    setUploadingIndex(index);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      updateVariantField(index, "image", data.secure_url);
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingIndex(null);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Variant Configuration
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            {variantTypes.map(type => (
              <Badge 
                key={type} 
                variant="secondary" 
                className="pl-3 pr-1 h-8 gap-2 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                <span className="text-[11px] font-semibold">{type}</span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-5 w-5 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 p-0 text-zinc-500"
                  onClick={() => removeVariantType(type)}
                >
                  <Plus className="h-3 w-3 rotate-45" />
                </Button>
              </Badge>
            ))}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Input 
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={addVariantType}
                placeholder="Add option (e.g. Color, Size, Style)"
                className="h-8 pl-3 pr-8 text-xs rounded-full bg-zinc-50 border-zinc-200 focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={addVariantType}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 px-1">
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            Define attributes that change per variant (e.g., Color, Material, Size).
          </p>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Product Variants
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
              {variants.length} variant{variants.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={addVariant}
          className="h-9 rounded-full bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all active:scale-95"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/30 dark:border-zinc-800 dark:bg-zinc-900/20">
          <div className="mb-3 rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
            <Plus className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">No variants added yet</p>
          <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest">Click add variant to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
             {/* Simple Scroll Hint */}
             <div className="md:hidden h-1 w-full bg-zinc-100 dark:bg-zinc-800" />
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <th className="w-10 px-4 py-3"></th>
                  {variantTypes.map(type => (
                    <th key={type} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{type}</th>
                  ))}
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">SKU</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Price (₹)</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Discount (₹)</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">Stock</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">Image</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {variants.map((variant, index) => (
                  <tr key={index} className="group hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <GripVertical className="h-4 w-4 text-zinc-300 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing transition-colors" />
                    </td>
                    {variantTypes.map(type => {
                      const attr = (variant.attributes || []).find(a => a.name === type);
                      return (
                        <td key={type} className="px-3 py-3">
                          <Input
                            placeholder={type}
                            value={attr?.value || ""}
                            onChange={(e) => updateVariantAttribute(index, type, e.target.value)}
                            className="h-8 min-w-[100px] rounded-lg border-zinc-200 bg-transparent text-xs font-medium focus:bg-white dark:border-zinc-800 dark:focus:bg-zinc-950 transition-all"
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-3">
                      <Input
                        placeholder="SKU"
                        value={variant.sku}
                        onChange={(e) => updateVariantField(index, "sku", e.target.value)}
                        className="h-8 w-32 rounded-lg border-zinc-200 bg-transparent font-mono text-[11px] dark:border-zinc-800"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">₹</span>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariantField(index, "price", e.target.value)}
                          className="h-8 w-24 pl-6 rounded-lg border-zinc-200 bg-transparent text-xs font-bold dark:border-zinc-800"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">₹</span>
                        <Input
                          type="number"
                          value={variant.discountPrice ?? ""}
                          onChange={(e) => updateVariantField(index, "discountPrice", e.target.value)}
                          placeholder="Ex: 50"
                          className="h-8 w-24 pl-6 rounded-lg border-zinc-200 bg-transparent text-xs dark:border-zinc-800"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariantField(index, "stock", e.target.value)}
                        className="h-8 w-20 mx-auto text-center rounded-lg border-zinc-200 bg-transparent text-xs font-bold dark:border-zinc-800"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-lg mx-auto flex items-center justify-center border-dashed border-2",
                              variant.image ? "border-solid border-zinc-200 dark:border-zinc-700 p-0 overflow-hidden" : "border-zinc-300 text-zinc-400 hover:text-zinc-600 dark:border-zinc-700"
                            )}
                          >
                             {variant.image ? (
                               <img src={variant.image} alt="V" className="h-full w-full object-cover" />
                             ) : (
                               <ImageIcon className="h-3.5 w-3.5" />
                             )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="end">
                           <div className="p-4 space-y-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Variant Image</h4>
                              <div className="flex gap-2">
                                <Input
                                  value={variant.image || ""}
                                  onChange={(e) => updateVariantField(index, "image", e.target.value)}
                                  placeholder="Image URL..."
                                  className="h-8 text-xs bg-zinc-50 dark:bg-zinc-900" 
                                />
                                <div className="relative">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 shrink-0" disabled={uploadingIndex === index}>
                                        {uploadingIndex === index ? (
                                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent"/>
                                        ) : (
                                            <Upload className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(index, e)}
                                        disabled={uploadingIndex === index}
                                    />
                                </div>
                              </div>
                              {variant.image && (
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                    <img src={variant.image} alt="Preview" className="h-full w-full object-contain" />
                                    <Button 
                                      size="icon" 
                                      variant="destructive"
                                      className="absolute top-1 right-1 h-6 w-6 rounded-md"
                                      onClick={() => updateVariantField(index, "image", "")}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                              )}
                           </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all">
                <div className="flex items-center justify-between border-b border-zinc-50 bg-zinc-50/30 px-4 py-2.5 dark:border-zinc-800/50 dark:bg-zinc-800/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                      #{index + 1}
                    </Badge>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">
                      {variant.variantName || "Unnamed Variant"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
                    className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {variantTypes.map(type => {
                      const attr = (variant.attributes || []).find(a => a.name === type);
                      return (
                        <div key={type} className="space-y-1.5">
                          <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 px-0.5">{type}</Label>
                          <Input
                            value={attr?.value || ""}
                            onChange={(e) => updateVariantAttribute(index, type, e.target.value)}
                            placeholder={`e.g. ${type}`}
                            className="h-9 rounded-xl bg-zinc-50 border-zinc-200 text-xs dark:bg-zinc-950 dark:border-zinc-800"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                       <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 px-0.5">SKU</Label>
                       <Input
                         value={variant.sku}
                         onChange={(e) => updateVariantField(index, "sku", e.target.value)}
                         placeholder="SKU-XXXXXX"
                         className="h-9 rounded-xl bg-zinc-50 border-zinc-200 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-800 uppercase"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 px-0.5">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">₹</span>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariantField(index, "price", e.target.value)}
                          className="h-9 pl-6 rounded-xl bg-zinc-50 border-zinc-200 font-bold dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 px-0.5">Discount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">₹</span>
                        <Input
                          type="number"
                          value={variant.discountPrice || ""}
                          onChange={(e) => updateVariantField(index, "discountPrice", e.target.value)}
                          placeholder="Optional"
                          className="h-9 pl-6 rounded-xl bg-zinc-50 border-zinc-200 font-bold dark:bg-zinc-950 dark:border-zinc-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 px-0.5">Stock</Label>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariantField(index, "stock", e.target.value)}
                        className="h-9 rounded-xl bg-zinc-50 border-zinc-200 font-bold dark:bg-zinc-950 dark:border-zinc-800"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 px-0.5">Image</Label>
                      <div className="flex gap-2">
                          <Input
                            value={variant.image || ""}
                            onChange={(e) => updateVariantField(index, "image", e.target.value)}
                            placeholder="Image URL..."
                            className="h-9 rounded-xl bg-zinc-50 border-zinc-200 text-xs dark:bg-zinc-950 dark:border-zinc-800 flex-1"
                          />
                          <div className="relative">
                                <Button size="icon" variant="secondary" className="h-9 w-9 shrink-0 rounded-xl" disabled={uploadingIndex === index}>
                                    {uploadingIndex === index ? (
                                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent"/>
                                    ) : (
                                        <Upload className="h-4 w-4" />
                                    )}
                                </Button>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(index, e)}
                                    disabled={uploadingIndex === index}
                                />
                          </div>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
