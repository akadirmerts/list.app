import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ColorPicker, COLORS } from "./ColorPicker";
import { Palette } from "lucide-react";

interface ItemEditModalProps {
  itemText: string;
  itemColor?: string;
  onSave: (text: string, color: string) => void;
  onCancel: () => void;
}

export function ItemEditModal({
  itemText,
  itemColor = "",
  onSave,
  onCancel,
}: ItemEditModalProps) {
  const [text, setText] = useState(itemText);
  const [color, setColor] = useState(itemColor);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim(), color);
    }
  };

  const selectedColorData = COLORS.find((c) => c.id === color);

  return (
    <>
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Öğeyi Düzenle</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Metin</label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Öğe metnini girin..."
                autoFocus
                className="input-memphis"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Renk</label>
              <div className="flex items-center gap-2">
                {selectedColorData && (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-foreground"
                    style={{ backgroundColor: selectedColorData.hex }}
                  />
                )}
                <Button
                  onClick={() => setShowColorPicker(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {selectedColorData ? selectedColorData.label : "Renk Seç"}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={onCancel} variant="outline" className="flex-1">
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={!text.trim()}
                className="flex-1 bg-primary text-primary-foreground"
              >
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showColorPicker && (
        <ColorPicker
          selectedColor={color}
          onColorChange={setColor}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </>
  );
}
