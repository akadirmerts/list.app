import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const COLORS = [
  { id: "primary", label: "Nane Yeşili", hex: "#4ade80" },
  { id: "secondary", label: "Leylak", hex: "#a78bfa" },
  { id: "accent", label: "Sarı", hex: "#fbbf24" },
  { id: "red", label: "Kırmızı", hex: "#ef4444" },
  { id: "blue", label: "Mavi", hex: "#3b82f6" },
  { id: "pink", label: "Pembe", hex: "#ec4899" },
];

interface ColorPickerProps {
  selectedColor?: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({
  selectedColor,
  onColorChange,
  onClose,
}: ColorPickerProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Renk Seç</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => {
                onColorChange(color.id);
                onClose();
              }}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${selectedColor === color.id
                  ? "border-foreground scale-105"
                  : "border-border hover:border-foreground/50"
                }`}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-foreground"
                style={{ backgroundColor: color.hex }}
              />
              <div className="text-xs font-medium text-center">{color.label}</div>
            </button>
          ))}
        </div>

        {/* Buttons removed as requested */}
      </DialogContent>
    </Dialog>
  );
}

interface ColorBadgeProps {
  color?: string;
  size?: "sm" | "md" | "lg";
}

export function ColorBadge({ color, size = "md" }: ColorBadgeProps) {
  if (!color) return null;

  const colorData = COLORS.find((c) => c.id === color);
  if (!colorData) return null;

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`rounded-full border border-foreground/20 ${sizeClasses[size]}`}
      style={{ backgroundColor: colorData.hex }}
      title={colorData.label}
    />
  );
}

interface ColorButtonProps {
  color?: string;
  size?: "sm" | "md";
}

export function ColorButton({ color, size = "md" }: ColorButtonProps) {
  const colorData = COLORS.find((c) => c.id === color);
  if (!colorData) return null;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${colorData.hex}20`,
        border: `1.5px solid ${colorData.hex}`,
        color: colorData.hex,
      }}
    >
      {colorData.label}
    </div>
  );
}
