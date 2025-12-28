"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AdminSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function AdminSearch({
  placeholder = "Search...",
  value,
  onChange,
  className,
}: AdminSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Listen for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative group w-full", className)}>
      <motion.div
        initial={false}
        animate={{
          scale: isFocused ? 1.01 : 1,
          boxShadow: isFocused 
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" 
            : "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
        }}
        className="relative flex items-center"
      >
        <Search className={cn(
          "absolute left-5 h-4 w-4 transition-all duration-300 pointer-events-none z-10",
          isFocused ? "text-zinc-900 scale-110 dark:text-zinc-100" : "text-zinc-400"
        )} />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-14 pl-12 pr-24 rounded-2xl border-zinc-200/60 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300",
            "placeholder:text-zinc-400 placeholder:font-medium",
            "focus-visible:ring-0 focus-visible:border-emerald-500/50 dark:focus-visible:border-emerald-500/50",
            "dark:bg-zinc-900/70 dark:border-zinc-800/60",
            isFocused && "bg-white dark:bg-zinc-900 shadow-xl"
          )}
        />

        <div className="absolute right-4 flex items-center gap-2">
          <AnimatePresence mode="wait">
            {value ? (
              <motion.div
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => onChange("")}
                >
                  <X className="h-4 w-4 text-zinc-500" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="shortcut"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 pointer-events-none"
              >
                <Command className="h-3 w-3 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-400">K</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Subtle bottom highlight */}
      <div className={cn(
        "absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/20 dark:via-emerald-400/20 to-transparent transition-opacity duration-500",
        isFocused ? "opacity-100" : "opacity-0"
      )} />
    </div>
  );
}

// Debounce hook for search
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
