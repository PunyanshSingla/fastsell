
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";

interface CategoryTableProps {
  categories: any[];
  onEdit: (category: any) => void;
  onDelete: (id: string) => void;
}

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-200/50 bg-white/50 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
              <TableHead className="w-[80px] py-4">Image</TableHead>
              <TableHead className="py-4">Title</TableHead>
              <TableHead className="hidden md:table-cell py-4">Slug</TableHead>
              <TableHead className="hidden md:table-cell py-4 text-center">Products</TableHead>
              <TableHead className="text-right py-4 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2">
                      <Edit className="h-6 w-6 opacity-20" />
                    </div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">No categories found</p>
                    <p className="text-sm">Get started by creating your first category.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 leading-relaxed cursor-pointer" onClick={() => (window.location.href = `/admin/categories/${category._id}`)}>
                  <TableCell className="py-4">
                    {category.image?.asset?.url ? (
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-100 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
                        <Image
                          src={category.image.asset.url}
                          alt={category.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-medium text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-700">
                        No Img
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 hover:underline decoration-zinc-400 underline-offset-4">{category.title}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-4">
                    <code className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {category.productCount || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <div className="flex justify-end gap-2 px-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(category)}
                        className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md dark:hover:bg-zinc-800 transition-all active:scale-95"
                      >
                        <Edit className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all active:scale-95"
                        onClick={() => onDelete(category._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
