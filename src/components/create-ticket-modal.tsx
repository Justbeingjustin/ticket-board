'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Column, Priority, User } from '@/lib/types';
import { UserAvatar } from './user-avatar';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  columns: Column[];
  priorities: Priority[];
  users: User[];
  defaultStatus?: string;
  onCreate: (data: {
    title: string;
    status: string;
    owner?: string;
    priority: string;
    body?: string;
  }) => Promise<void>;
}

export function CreateTicketModal({
  open,
  onClose,
  columns,
  priorities,
  users,
  defaultStatus,
  onCreate,
}: CreateTicketModalProps) {
  // Default priority to 'high' and owner to 'bot' (user_1)
  const defaultPriority = 'high';
  const defaultOwner = 'bot';
  
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState(defaultStatus || columns[0]?.id || '');
  const [owner, setOwner] = useState(defaultOwner);
  const [priority, setPriority] = useState(defaultPriority);
  const [body, setBody] = useState('');
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    setTitle('');
    setStatus(defaultStatus || columns[0]?.id || '');
    setOwner(defaultOwner);
    setPriority(defaultPriority);
    setBody('');
  };

  const handleCreate = async () => {
    if (!title.trim() || !priority || priority === 'none') return;
    
    setCreating(true);
    try {
      await onCreate({
        title: title.trim(),
        status,
        owner: owner && owner !== 'none' ? owner : undefined,
        priority,
        body: body.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedPriority = priorities.find(p => p.id === priority);
  const selectedOwner = users.find(u => u.id === owner);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Add a new ticket to your board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              autoFocus
            />
          </div>

          {/* Status, Priority, Owner */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  {selectedPriority ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: selectedPriority.color }}
                      />
                      {selectedPriority.name}
                    </div>
                  ) : (
                    <SelectValue placeholder="Select priority" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger>
                  {selectedOwner ? (
                    <UserAvatar user={selectedOwner} size="sm" showName />
                  ) : (
                    <SelectValue placeholder="Unassigned" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">Unassigned</span>
                  </SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      <UserAvatar user={u} size="sm" showName />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              content={body}
              onChange={setBody}
              placeholder="Description"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || !priority || priority === 'none' || creating}>
            {creating ? 'Creating...' : 'Create Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
