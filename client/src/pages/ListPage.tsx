import React, { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/lib/i18n";
import { useWebSocket } from "@/hooks/useWebSocket";
import { nanoid } from "nanoid";
import QRCode from "react-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Copy, ArrowUp, ArrowDown, Trash2, Edit2, Check, Palette, QrCode, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ItemEditModal } from "@/components/ItemEditModal";
import { ColorBadge, ColorPicker, COLORS } from "@/components/ColorPicker";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableListItem } from "@/components/SortableListItem";
import { useCallback } from "react";

const CategoryBadge = ColorBadge;

interface ListItemWithUI {
  id: number;
  listId: number;
  text: string;
  completed: boolean;
  color: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  isEditing?: boolean;
  editText?: string;
}

export default function ListPage() {
  const [, params] = useRoute("/list/:slug");
  const slug = params?.slug as string;

  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const [items, setItems] = useState<ListItemWithUI[]>([]);
  const [newItemText, setNewItemText] = useState("");
  // Default to a random color on init
  const [newItemColor, setNewItemColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)].id);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [listTitle, setListTitle] = useState("Yükleniyor...");
  const [listId, setListId] = useState<number | null>(null);
  const [sessionId] = useState(() => nanoid());
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState(() => {
    // Try to auto-fill password from session storage
    if (params?.slug) {
      return sessionStorage.getItem(`list-password-${params.slug}`) || "";
    }
    return "";
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch list data
  const { data: listData, isLoading, error } = trpc.lists.getBySlug.useQuery(
    { slug, password: passwordInput || undefined },
    { enabled: !!slug && !showPasswordModal }
  );

  // Mutations
  const createItemMutation = trpc.items.add.useMutation();
  const updateItemMutation = trpc.items.update.useMutation();
  const deleteItemMutation = trpc.items.delete.useMutation();
  const updateListMutation = trpc.lists.update.useMutation();
  const registerSessionMutation = trpc.sessions.register.useMutation();

  // DND Sensors (Moved up to avoid conditional hook execution error)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // WebSocket setup
  const {
    isConnected,
    emitItemAdded,
    emitItemUpdated,
    emitItemDeleted,
    emitListUpdated,
  } = useWebSocket({
    listSlug: slug,
    sessionId, // Pass the sessionId from state
    onUpdate: (update) => {
      // console.log("Received update:", update);
      if (update.type === "item-added") {
        setItems((prev: ListItemWithUI[]) => {
          if (prev.some(item => item.id === update.data.id)) return prev;
          return [...prev, update.data].sort((a, b) => a.order - b.order);
        });
      } else if (update.type === "item-updated") {
        setItems((prev: ListItemWithUI[]) =>
          prev.map((item) => (item.id === update.data.id ? update.data : item))
        );
      } else if (update.type === "item-deleted") {
        setItems((prev: ListItemWithUI[]) => prev.filter((item) => item.id !== update.data.itemId));
      } else if (update.type === "list-updated") {
        setListTitle(update.data.title);
      }
    },
    onUserJoined: (id) => {
      // Ignore self join
      if (id === sessionId) return;
      setActiveUsers((prev: string[]) => [...new Set([...prev, id])]);
    },
    onUserLeft: (sessionId) => {
      setActiveUsers((prev: string[]) => prev.filter((id) => id !== sessionId));
    },
  });

  // Check password error
  useEffect(() => {
    if (error?.message?.includes("Invalid password") || error?.message?.includes("password")) {
      setShowPasswordModal(true);
      setPasswordInput("");
    }
  }, [error]);

  // Initialize
  useEffect(() => {
    if (listData) {
      setListId(listData.id);
      setListTitle(listData.title);
      setIsPasswordProtected(Boolean(listData.isPasswordProtected));
      setShowPasswordModal(false);
      setItems(
        listData.items.map((item) => ({
          ...item,
          completed: Boolean(item.completed),
          isEditing: false,
          editText: item.text,
        }))
      );

      // Register session
      registerSessionMutation.mutate({
        listId: listData.id,
        sessionId,
        userAgent: navigator.userAgent,
      });
    }
  }, [listData]);

  // Password modal
  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-memphis bg-white max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">{t.list.password_modal.title}</h2>
          <p className="text-foreground/70 mb-4">{t.list.password_modal.desc}</p>
          <Input
            type="password"
            placeholder={t.list.password_modal.placeholder}
            value={passwordInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordInput(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") {
                // Query will automatically retry with new password
                setShowPasswordModal(false);
              }
            }}
            className="input-memphis mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="flex-1"
            >
              {t.list.password_modal.cancel}
            </Button>
            <Button
              onClick={() => {
                // Trigger query with password
                if (passwordInput.trim()) {
                  sessionStorage.setItem(`list-password-${slug}`, passwordInput.trim());
                }
                setShowPasswordModal(false);
              }}
              className="flex-1 bg-primary text-primary-foreground"
              disabled={!passwordInput}
            >
              {t.list.password_modal.submit}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t.list.errors.not_found_title}</h1>
          <Button onClick={() => setLocation("/")} className="btn-memphis bg-primary text-primary-foreground">
            {t.list.errors.not_found_btn}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">{t.list.errors.loading}</p>
        </div>
      </div>
    );
  }

  const handleAddItem = async () => {
    if (!newItemText.trim() || !listId) return;

    try {
      const item = await createItemMutation.mutateAsync({
        listId,
        text: newItemText.trim(),
        color: newItemColor || undefined,
      });

      setItems((prev: ListItemWithUI[]) =>
        [...prev, { ...item, completed: Boolean(item.completed), isEditing: false, editText: item.text }]
          .sort((a, b) => a.order - b.order)
      );
      emitItemAdded(item);
      setNewItemText("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error(t.list.notifications.error_add);
    }
  };

  const handleToggleComplete = async (item: ListItemWithUI) => {
    try {
      const updated = await updateItemMutation.mutateAsync({
        itemId: item.id,
        completed: !item.completed,
      });

      setItems((prev: ListItemWithUI[]) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...updated, completed: Boolean(updated.completed) } : i))
      );
      emitItemUpdated(updated);
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Öğe güncellenemedi");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItemMutation.mutateAsync({ itemId });
      setItems((prev: ListItemWithUI[]) => prev.filter((i) => i.id !== itemId));
      emitItemDeleted(itemId);
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error(t.list.notifications.error_delete);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);
      }
    }
  };

  const handleEditItem = async (
    itemId: number,
    text: string,
    color: string
  ) => {
    try {
      const updated = await updateItemMutation.mutateAsync({
        itemId,
        text,
        color: color || undefined,
      });

      setItems((prev: ListItemWithUI[]) =>
        prev.map((i) => (i.id === itemId ? { ...i, ...updated, completed: Boolean(updated.completed) } : i))
      );
      emitItemUpdated(updated);
      setEditingItemId(null);
      toast.success(t.list.notifications.item_updated);
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error(t.list.notifications.error_update);
    }
  };

  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    // Update order
    const updates = newItems.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    try {
      await updateItemMutation.mutateAsync({
        itemId: items[index].id,
        order: newIndex,
      });

      setItems(newItems);
    } catch (error) {
      console.error("Failed to reorder items:", error);
      toast.error(t.list.notifications.error_reorder);
    }
  };

  const handleSaveTitle = async () => {
    if (!editingTitle.trim() || !listId) return;

    try {
      await updateListMutation.mutateAsync({
        listId,
        title: editingTitle.trim(),
      });

      setListTitle(editingTitle.trim());
      emitListUpdated({ id: listId, title: editingTitle.trim() });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update title:", error);
      toast.error(t.list.notifications.error_title);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/list/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success(t.list.notifications.link_copied);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b-4 border-primary sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              className="text-sm font-medium hover:bg-muted"
            >
              ← {t.list.home_btn}
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(activeUsers.length + 1, 3) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xs font-bold"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-foreground/70">
                {activeUsers.length + 1} {t.list.users}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            {isEditingTitle ? (
              <div className="flex gap-2 flex-1">
                <Input
                  value={editingTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTitle(e.target.value)}
                  className="input-memphis flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleSaveTitle}
                  className="btn-memphis bg-primary text-primary-foreground px-4"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-black uppercase memphis-text-shadow flex-1">
                  {listTitle}
                </h1>
                <Button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setEditingTitle(listTitle);
                  }}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-muted"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Password Display (Hidden by default) */}
          {isPasswordProtected && (
            <div className="w-full mb-4 bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center gap-3">
              <Lock className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="text-sm text-orange-600 font-bold whitespace-nowrap">{t.list.password_label}:</span>
              <div className="group relative cursor-pointer flex-1">
                <div className="blur-sm group-hover:blur-none transition-all font-mono text-orange-700 select-all text-lg tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                  {passwordInput || "******"}
                </div>
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button
              onClick={() => setShowQR(true)}
              variant="outline"
              className="btn-memphis bg-white w-full sm:w-auto"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {t.list.share_qr}
            </Button>
            <Button
              onClick={handleCopyLink}
              className="btn-memphis bg-accent text-accent-foreground w-full sm:w-auto"
            >
              <Copy className="w-4 h-4 mr-2" />
              {t.list.share_link}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Add Item Form */}
        <div className="card-memphis bg-white mb-8">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                ref={inputRef}
                type="text"
                placeholder={t.list.add_placeholder}
                value={newItemText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemText(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter") {
                    handleAddItem();
                  }
                }}
                className="input-memphis flex-1"
              />
              <Button
                onClick={handleAddItem}
                disabled={!newItemText.trim()}
                className="btn-memphis bg-primary text-primary-foreground px-6 py-2 rounded-xl whitespace-nowrap"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t.list.add_btn}
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                onClick={() => setShowColorPicker(true)}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Palette className="w-4 h-4 mr-2" />
                {t.list.color_btn}
              </Button>
              {newItemColor && <CategoryBadge color={newItemColor} size="md" />}
            </div>
          </div>
        </div>

        {/* Items List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.filter(i => !i.completed || showCompleted).map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-foreground/50 font-medium">
                    {t.list.empty_state}
                  </p>
                </div>
              ) : (
                items
                  .filter((item) => !item.completed || showCompleted)
                  .map((item) => (
                    <SortableListItem
                      key={item.id}
                      id={item.id}
                      text={item.text}
                      completed={item.completed}
                      color={item.color || "primary"}
                      onToggleComplete={() => handleToggleComplete(item)}
                      onDelete={handleDeleteItem}
                      onEdit={setEditingItemId}
                      onColorChange={setEditingItemId}
                    />
                  ))
              )}
            </div>
          </SortableContext>
        </DndContext>



        {/* Stats and Completed Toggle */}
        {items.length > 0 && (
          <div className="mt-12 space-y-4">
            <div className="p-6 bg-white rounded-2xl border-2 border-primary">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{items.filter((i) => !i.completed).length}</p>
                  <p className="text-sm text-foreground/70">{t.list.todo_title}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-secondary">
                    {items.filter((i) => i.completed).length}
                  </p>
                  <p className="text-sm text-foreground/70">{t.list.completed_title}</p>
                </div>
              </div>
            </div>
            {items.filter((i) => i.completed).length > 0 && !showCompleted && (
              <Button
                onClick={() => setShowCompleted(true)}
                variant="outline"
                className="w-full btn-memphis"
              >
                {t.list.show_completed}
              </Button>
            )}
            {showCompleted && items.filter((i) => i.completed).length > 0 && (
              <Button
                onClick={() => setShowCompleted(false)}
                variant="outline"
                className="w-full btn-memphis"
              >
                {t.list.hide_completed}
              </Button>
            )}
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItemId !== null && (
          <ItemEditModal
            itemText={items.find((i) => i.id === editingItemId)?.text || ""}
            itemColor={items.find((i) => i.id === editingItemId)?.color || ""}
            onSave={(text, color) =>
              handleEditItem(editingItemId, text, color)
            }
            onCancel={() => setEditingItemId(null)}
          />
        )}

        {/* New Item Color Picker */}
        {showColorPicker && (
          <ColorPicker
            selectedColor={newItemColor}
            onColorChange={setNewItemColor}
            onClose={() => setShowColorPicker(false)}
          />
        )}
        {/* QR Code Modal */}
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">{t.list.qr_modal.title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-white p-4 rounded-xl border-2 border-foreground mb-4">
                <QRCode
                  value={`${window.location.origin}/list/${slug}`}
                  size={200}
                />
              </div>
              <p className="text-center text-sm text-foreground/70 mb-4">
                {t.list.qr_modal.desc}
              </p>
              <Button onClick={() => setShowQR(false)} className="w-full">
                {t.list.qr_modal.close}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


