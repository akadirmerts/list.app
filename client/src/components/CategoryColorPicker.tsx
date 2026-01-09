import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export const CATEGORIES = [
  { id: "work", label: "İş", icon: "💼" },
  { id: "personal", label: "Kişisel", icon: "👤" },
  { id: "shopping", label: "Alışveriş", icon: "🛒" },
  { id: "health", label: "Sağlık", icon: "💪" },
  { id: "learning", label: "Öğrenme", icon: "📚" },
  { id: "home", label: "Ev", icon: "🏠" },
];

export const COLORS = [
  { id: "primary", label: "Nane Yeşili", hex: "#4ade80" },
  { id: "secondary", label: "Leylak", hex: "#a78bfa" },
  { id: "accent", label: "Sarı", hex: "#fbbf24" },
  { id: "red", label: "Kırmızı", hex: "#ef4444" },
  { id: "blue", label: "Mavi", hex: "#3b82f6" },
  { id: "pink", label: "Pembe", hex: "#ec4899" },
];

interface CategoryColorPickerProps {
  selectedCategory?: string;
  selectedColor?: string;
  onCategoryChange: (category: string) => void;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export function CategoryColorPicker({
  selectedCategory,
  selectedColor,
  onCategoryChange,
  onColorChange,
  onClose,
}: CategoryColorPickerProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kategori ve Renk Seç</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Kategori</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    selectedCategory === cat.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Renk</Label>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onColorChange(color.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedColor === color.id
                      ? "border-foreground scale-105"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-foreground"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs font-medium text-center">{color.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => {
                onCategoryChange("");
                onColorChange("");
              }}
              variant="outline"
              className="flex-1"
            >
              Temizle
            </Button>
            <Button onClick={onClose} className="flex-1 bg-primary text-primary-foreground">
              Tamam
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CategoryBadgeProps {
  category?: string;
  color?: string;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, color, size = "md" }: CategoryBadgeProps) {
  if (!category && !color) return null;

  const categoryData = CATEGORIES.find((c) => c.id === category);
  const colorData = COLORS.find((c) => c.id === color);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: colorData ? `${colorData.hex}20` : "transparent",
        border: `1.5px solid ${colorData?.hex || "#ccc"}`,
      }}
    >
      {categoryData && <span>{categoryData.icon}</span>}
      <span style={{ color: colorData?.hex || "#666" }}>
        {categoryData?.label || colorData?.label || ""}
      </span>
    </div>
  );
}
