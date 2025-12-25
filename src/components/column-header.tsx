'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Column } from '@/lib/types';

interface ColumnHeaderProps {
  column: Column;
  ticketCount: number;
  isFirst: boolean;
  onAddTicket: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export function ColumnHeader({
  column,
  ticketCount,
  isFirst,
  onAddTicket,
  onRename,
  onDelete,
  dragHandleProps,
}: ColumnHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const handleRename = () => {
    if (name.trim() && name !== column.name) {
      onRename(name.trim());
    }
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete column "${column.name}"? Tickets will be moved to the first column.`)) {
      onDelete();
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-t-lg border-b">
      <div className="flex items-center gap-2">
        {/* Drag Handle */}
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5 -ml-1"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        
        {editing ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setName(column.name);
                setEditing(false);
              }
            }}
            className="h-7 w-32 text-sm"
            autoFocus
          />
        ) : (
          <h3 className="font-semibold text-sm">{column.name}</h3>
        )}
        <Badge variant="secondary" className="text-xs">
          {ticketCount}
        </Badge>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-pointer"
          onClick={onAddTicket}
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            {!isFirst && (
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
