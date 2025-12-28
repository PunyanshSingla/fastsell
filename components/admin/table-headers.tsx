import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ============================================
// Order Table Headers
// ============================================

interface TableHeaderColumn {
  label: string;
  className?: string;
}

const ORDER_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: "Order", className: "pl-6" },
  { label: "Customer", className: "hidden sm:table-cell" },
  { label: "Items", className: "hidden text-center md:table-cell" },
  { label: "Total", className: "text-right sm:text-left" },
  { label: "Status", className: "hidden sm:table-cell" },
  { label: "Date", className: "hidden text-right md:table-cell pr-6" },
];

export function OrderTableHeader() {
  return (
    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
        {ORDER_TABLE_COLUMNS.map((column) => (
          <TableHead 
            key={column.label} 
            className={cn(
              "h-14 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500",
              column.className
            )}
          >
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

// ============================================
// Product/Inventory Table Headers
// ============================================

const PRODUCT_TABLE_COLUMNS: TableHeaderColumn[] = [
  { label: "Media", className: "hidden w-24 pl-6 sm:table-cell" },
  { label: "Product Info" },
  { label: "Pricing", className: "hidden w-40 md:table-cell" },
  { label: "Inventory", className: "hidden w-40 md:table-cell" },
  { label: "Status", className: "hidden w-24 lg:table-cell" },
  { label: "Actions", className: "hidden text-right pr-6 sm:table-cell" },
];

export function ProductTableHeader() {
  return (
    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
        {PRODUCT_TABLE_COLUMNS.map((column) => (
          <TableHead 
            key={column.label} 
            className={cn(
              "h-14 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500",
              column.className
            )}
          >
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
