import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface SortableListItemProps {
  id: number;
  text: string;
  completed: boolean;
  color: string;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onColorChange: (id: number) => void;
}

const COLOR_MAP: Record<string, { bg: string; text: string; checkbox: string }> = {
  primary: { bg: "bg-primary border-primary", text: "text-primary-foreground", checkbox: "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" },
  secondary: { bg: "bg-secondary border-secondary", text: "text-secondary-foreground", checkbox: "border-secondary-foreground data-[state=checked]:bg-secondary-foreground data-[state=checked]:text-secondary" },
  accent: { bg: "bg-accent border-accent", text: "text-accent-foreground", checkbox: "border-accent-foreground data-[state=checked]:bg-accent-foreground data-[state=checked]:text-accent" },
  red: { bg: "bg-red-500 border-red-600", text: "text-white", checkbox: "border-white data-[state=checked]:bg-white data-[state=checked]:text-red-500" },
  blue: { bg: "bg-blue-500 border-blue-600", text: "text-white", checkbox: "border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-500" },
  pink: { bg: "bg-pink-500 border-pink-600", text: "text-white", checkbox: "border-white data-[state=checked]:bg-white data-[state=checked]:text-pink-500" },
};

export function SortableListItem({
  id,
  text,
  completed,
  color,
  onToggleComplete,
  onDelete,
  onEdit,
  onColorChange,
}: SortableListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colorStyle = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${isDragging ? "shadow-lg" : "hover:shadow-md"
        } ${colorStyle.bg} group`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-foreground/50 hover:text-foreground/70 flex-shrink-0"
        aria-label="Sürükle"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Checkbox */}
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggleComplete(id)}
        className={`w-6 h-6 rounded-md cursor-pointer border-2 transition-colors ${colorStyle.checkbox}`}
      />

      {/* Text */}
      <span
        onClick={() => onToggleComplete(id)}
        className={`flex-1 font-bold text-lg cursor-pointer select-none transition-all ${completed ? "line-through opacity-50" : ""
          } ${colorStyle.text}`}
      >
        {text}
      </span>

      {/* Color Change Icon */}
      <button
        onClick={() => onColorChange(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/60 hover:text-foreground flex-shrink-0"
        aria-label="Rengi değiştir"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {/* Delete Button */}
      <Button
        onClick={() => onDelete(id)}
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
