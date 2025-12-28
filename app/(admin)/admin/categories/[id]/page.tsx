"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface Category {
  _id: string;
  title: string;
  slug: string;
  image?: {
    asset: {
      url: string;
    };
  };
  productCount?: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: {
    asset: {
      url: string;
    };
  }[];
  category: string;
  featured: boolean;
  status: string; // Assuming status exists or we derive it
}

export default function SingleCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const res = await fetch(`/api/admin/categories/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
             toast.error("Category not found");
             router.push("/admin/categories");
             return;
          }
          throw new Error("Failed to fetch category data");
        }
        const data = await res.json();
        setCategory(data.category);
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching category data:", error);
        toast.error("Failed to load category details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryData();
    }
  }, [id, router]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!category) {
    return <div className="p-8 text-center">Category not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {category.title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    /{category.slug}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Details Card */}
        <div className="md:col-span-1 space-y-6">
            <div className="rounded-2xl border border-zinc-200/50 bg-white/50 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50 overflow-hidden shadow-sm p-6">
                <div className="aspect-square relative w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
                    {category.image?.asset?.url ? (
                        <Image
                            src={category.image.asset.url}
                            alt={category.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-400">
                            No Image
                        </div>
                    )}
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-sm text-muted-foreground">Products</span>
                        <span className="font-medium">{products.length}</span>
                    </div>
                     <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <span className="text-sm text-muted-foreground">ID</span>
                        <span className="font-mono text-xs text-zinc-500">{category._id}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Products List */}
        <div className="md:col-span-2">
             <div className="rounded-2xl border border-zinc-200/50 bg-white/50 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <h2 className="text-lg font-semibold">Products in this Category</h2>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/50">
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No products found in this category.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product._id}>
                                         <TableCell>
                                            <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-100">
                                                {product.images?.[0]?.asset?.url ? (
                                                    <Image 
                                                        src={product.images[0].asset.url} 
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                         </TableCell>
                                         <TableCell className="font-medium">{product.name}</TableCell>
                                         <TableCell>₹{product.price}</TableCell>
                                         <TableCell>{product.stock}</TableCell>
                                         <TableCell className="text-right">
                                            {/* Reuse existing edit logic or link to product edit page if available, for now just simple view */}
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/inventory/${product._id}`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                         </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
