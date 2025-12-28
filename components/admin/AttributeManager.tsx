"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Attribute {
  name: string;
  value: string;
}

interface AttributeManagerProps {
  attributes: Attribute[];
  onUpdate: (attributes: Attribute[]) => void;
}

export function AttributeManager({ attributes = [], onUpdate }: AttributeManagerProps) {
  const removeAttribute = (index: number) => {
    onUpdate(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: keyof Attribute, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    onUpdate(newAttributes);
  };

  return (
    <div className="space-y-3">
      {attributes.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No details added (e.g., Material, Brand, Dimensions)
          </p>
      ) : (
        attributes.map((attr, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Name (e.g. Material)"
                value={attr.name}
                onChange={(e) => updateAttribute(index, "name", e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Value (e.g. Cotton)"
                value={attr.value}
                onChange={(e) => updateAttribute(index, "value", e.target.value)}
                className="h-9 text-xs" 
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeAttribute(index)}
              className="h-9 w-9 text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
