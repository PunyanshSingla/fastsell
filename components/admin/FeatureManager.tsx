import { useState, useRef } from "react";
import { Plus, X, List, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FeatureManagerProps {
  features: string[];
  onUpdate: (features: string[]) => void;
}

export function FeatureManager({ features, onUpdate }: FeatureManagerProps) {
  const [newFeature, setNewFeature] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFeature = () => {
    if (!newFeature.trim()) return;
    onUpdate([...features, newFeature.trim()]);
    setNewFeature("");
    // Keep focus for rapid entry
    inputRef.current?.focus();
  };

  const removeFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-end px-1">
           <span className="text-[10px] text-zinc-400 font-medium">
            {features.length} added
          </span>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              ref={inputRef}
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature (e.g. '100% Organic Cotton')"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
              className="h-10 rounded-xl pl-9 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-all dark:bg-zinc-900/50 dark:border-zinc-800 dark:focus:bg-zinc-950"
            />
          </div>
          <Button
            type="button"
            onClick={addFeature}
            disabled={!newFeature.trim()}
            className={cn(
              "h-10 w-10 p-0 rounded-xl shrink-0 transition-all",
              newFeature.trim() 
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:scale-105 active:scale-95" 
                : "bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600"
            )}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {features.length > 0 ? (
          <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {features.map((feature, index) => (
              <li
                key={index}
                className="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 text-sm shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <List className="h-3 w-3" />
                </div>
                <span className="flex-1 font-medium text-zinc-700 dark:text-zinc-300 break-words">
                  {feature}
                </span>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-8 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
            <div className="mb-2 rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
              <Sparkles className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              No features yet
            </p>
            <p className="text-xs text-zinc-500 max-w-[180px] mt-1">
              Add key selling points to highlight your product
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
