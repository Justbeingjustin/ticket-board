'use client';

import { useState } from 'react';
import { Plus, LayoutGrid, Trash2, MoreVertical, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsPanel } from '@/components/settings-panel';
import type { Board } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  boards: Board[];
  selectedBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (name: string) => Promise<void>;
  onRenameBoard: (id: string, name: string) => Promise<void>;
  onDeleteBoard: (id: string) => Promise<void>;
}

export function Sidebar({
  boards,
  selectedBoard,
  onSelectBoard,
  onCreateBoard,
  onRenameBoard,
  onDeleteBoard,
}: SidebarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renamingBoard, setRenamingBoard] = useState<Board | null>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const handleCreate = async () => {
    if (!newBoardName.trim()) return;
    
    setCreating(true);
    try {
      await onCreateBoard(newBoardName.trim());
      setNewBoardName('');
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenRename = (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    setRenamingBoard(board);
    setRenameValue(board.name);
    setIsRenameOpen(true);
  };

  const handleRename = async () => {
    if (!renameValue.trim() || !renamingBoard) return;
    
    setRenaming(true);
    try {
      await onRenameBoard(renamingBoard.id, renameValue.trim());
      setIsRenameOpen(false);
      setRenamingBoard(null);
      setRenameValue('');
    } catch (error) {
      console.error('Failed to rename board:', error);
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this board? Ticket files will NOT be deleted.')) {
      await onDeleteBoard(boardId);
    }
  };

  return (
    <div className="w-60 bg-muted/30 border-r flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          Git Kanban
        </h1>
        <SettingsPanel />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
            Boards
          </div>
          {boards.map((board) => (
            <div
              key={board.id}
              className={cn(
                'group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors',
                selectedBoard?.id === board.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              )}
              onClick={() => onSelectBoard(board)}
            >
              <span className="truncate">{board.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => handleOpenRename(e as unknown as React.MouseEvent, board)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename Board
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={(e) => handleDelete(e as unknown as React.MouseEvent, board.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              New Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
              <DialogDescription>
                Add a new Kanban board to organize your tickets.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Board Name</Label>
                <Input
                  id="name"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g., Sprint 1"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!newBoardName.trim() || creating}>
                {creating ? 'Creating...' : 'Create Board'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rename Board Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
            <DialogDescription>
              Enter a new name for this board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename">Board Name</Label>
              <Input
                id="rename"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Board name"
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!renameValue.trim() || renaming}>
              {renaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
