'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Column } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ColumnManagerProps {
  open: boolean;
  onClose: () => void;
  columns: Column[];
  onSave: (columns: Column[]) => Promise<void>;
}

interface SortableColumnItemProps {
  column: Column;
  isFirst: boolean;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function SortableColumnItem({ column, isFirst, onRename, onDelete }: SortableColumnItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editName.trim()) {
      onRename(column.id, editName.trim());
    } else {
      setEditName(column.name);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(column.name);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-3 bg-muted/50 rounded-lg border',
        isDragging && 'opacity-50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-8"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 font-medium">{column.name}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {!isFirst && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => onDelete(column.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function ColumnManager({ open, onClose, columns: initialColumns, onSave }: ColumnManagerProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [saving, setSaving] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset state when dialog opens
  useState(() => {
    setColumns(initialColumns);
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRename = (id: string, name: string) => {
    setColumns((cols) => cols.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleDelete = (id: string) => {
    if (columns.length <= 1) {
      alert('You must have at least one column.');
      return;
    }
    if (confirm('Delete this column? Tickets in this column will be moved to the first column.')) {
      setColumns((cols) => cols.filter((c) => c.id !== id));
    }
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    const newColumn: Column = {
      id: `col_${Date.now()}`,
      name: newColumnName.trim(),
    };
    setColumns([...columns, newColumn]);
    setNewColumnName('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(columns);
      onClose();
    } catch (error) {
      console.error('Failed to save columns:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Columns</DialogTitle>
          <DialogDescription>
            Drag to reorder columns. Rename or delete columns as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Column list */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {columns.map((column, index) => (
                  <SortableColumnItem
                    key={column.id}
                    column={column}
                    isFirst={index === 0}
                    onRename={handleRename}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add new column */}
          <div className="flex gap-2 pt-2 border-t">
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="New column name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddColumn();
              }}
            />
            <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || columns.length === 0}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

