import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  primary: { bg: "bg-primary border-primary", text: "text-primary-foreground" },
  secondary: { bg: "bg-secondary border-secondary", text: "text-secondary-foreground" },
  accent: { bg: "bg-accent border-accent", text: "text-accent-foreground" },
  red: { bg: "bg-red-500 border-red-600", text: "text-white" },
  blue: { bg: "bg-blue-500 border-blue-600", text: "text-white" },
  pink: { bg: "bg-pink-500 border-pink-600", text: "text-white" },
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
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggleComplete(id)}
        className="w-5 h-5 rounded cursor-pointer flex-shrink-0"
      />

      {/* Text */}
      <span
        className={`flex-1 font-medium ${completed ? "line-through opacity-70" : ""
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
