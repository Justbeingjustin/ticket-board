'use client';

import { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Pencil, X, Check, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from './user-avatar';
import { RichTextEditor } from './rich-text-editor';
import type { Ticket, Column, Priority, User, Comment } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TicketDetailProps {
  ticket: Ticket | null;
  columns: Column[];
  priorities: Priority[];
  users: User[];
  open: boolean;
  onClose: () => void;
  onSave: (updates: {
    title?: string;
    status?: string;
    owner?: string | null;
    priority?: string | null;
    body?: string;
    comments?: Comment[];
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function TicketDetail({
  ticket,
  columns,
  priorities,
  users,
  open,
  onClose,
  onSave,
  onDelete,
}: TicketDetailProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState('');
  const [body, setBody] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setStatus(ticket.status);
      setOwner(ticket.owner || '');
      setPriority(ticket.priority || '');
      const bodyContent = ticket.body || '';
      setBody(bodyContent.startsWith('<') ? bodyContent : convertMarkdownToHtml(bodyContent));
      setComments(ticket.comments || []);
      setNewComment('');
      setEditingCommentId(null);
    }
  }, [ticket]);

  function convertMarkdownToHtml(markdown: string): string {
    if (!markdown) return '';
    let html = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.split('\n\n').map(p => `<p>${p}</p>`).join('');
    return html;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        title,
        status,
        owner: owner || null,
        priority: priority || null,
        body,
        comments,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save ticket:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!ticket) return;
    try {
      await navigator.clipboard.writeText(ticket.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const isEmptyHtml = (html: string) => {
    const stripped = html.replace(/<[^>]*>/g, '').trim();
    return !stripped;
  };

  const handleAddComment = () => {
    if (isEmptyHtml(newComment)) return;
    
    const comment: Comment = {
      id: `c_${Date.now()}`,
      author: owner || 'user_1',
      text: newComment,
      createdAt: new Date().toISOString(),
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditingCommentText(comment.text);
    }
  };

  const handleSaveCommentEdit = () => {
    if (!editingCommentId || isEmptyHtml(editingCommentText)) return;
    
    setComments(comments.map(c => 
      c.id === editingCommentId 
        ? { ...c, text: editingCommentText }
        : c
    ));
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    setComments(comments.filter(c => c.id !== commentId));
  };

  if (!ticket) return null;

  const selectedPriority = priorities.find(p => p.id === priority);
  const selectedOwner = users.find(u => u.id === owner);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogDescription>
            Edit ticket details including title, status, priority, assignee, description, and comments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-8 py-6 space-y-8">
            {/* Title Section - Inline editable heading style */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-5 gap-0.5 border-muted-foreground/30">
                  <Hash className="w-2.5 h-2.5" />
                  {ticket.id.replace('T-', '')}
                </Badge>
                <button
                  onClick={handleCopyLink}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {copied ? '✓ Copied' : 'Copy ID'}
                </button>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled ticket"
                title={title}
                className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 focus:placeholder:text-muted-foreground/20 caret-primary overflow-hidden text-ellipsis whitespace-nowrap"
              />
            </div>

            {/* Properties Section */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10">
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
                <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-10">
                    {selectedPriority ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: selectedPriority.color }}
                        />
                        {selectedPriority.name}
                      </div>
                    ) : (
                      <SelectValue placeholder="Select priority" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No priority</SelectItem>
                    {priorities.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
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
                <Label className="text-sm font-medium text-muted-foreground">Assignee</Label>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger className="h-10">
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

            {/* Description Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              <RichTextEditor
                content={body}
                onChange={setBody}
                placeholder="Describe the task, add context, or paste images..."
              />
            </div>

            <Separator className="my-2" />

            {/* Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium text-muted-foreground">
                  Comments {comments.length > 0 && `(${comments.length})`}
                </Label>
              </div>
              
              {/* Existing Comments */}
              {comments.length > 0 && (
                <div className="space-y-3">
                  {comments.map((comment) => {
                    const commentAuthor = users.find(u => u.id === comment.author);
                    const isEditing = editingCommentId === comment.id;
                    
                    return (
                      <div
                        key={comment.id}
                        className="p-4 rounded-lg border bg-muted/20 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <UserAvatar user={commentAuthor} size="sm" showName />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                            </span>
                            {!isEditing && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 cursor-pointer"
                                  onClick={() => handleEditComment(comment.id)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:text-red-600 cursor-pointer"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isEditing ? (
                          <div className="space-y-3">
                            <RichTextEditor
                              content={editingCommentText}
                              onChange={setEditingCommentText}
                              compact
                              placeholder="Edit your comment..."
                              onSubmit={handleSaveCommentEdit}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveCommentEdit}
                                disabled={isEmptyHtml(editingCommentText)}
                                className="cursor-pointer"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelCommentEdit}
                                className="cursor-pointer"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="text-sm text-foreground prose prose-sm dark:prose-invert overflow-hidden [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-2 [&_img]:block"
                            dangerouslySetInnerHTML={{ __html: comment.text }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Comment */}
              <div className="space-y-3">
                <RichTextEditor
                  content={newComment}
                  onChange={setNewComment}
                  compact
                  placeholder="Write a comment..."
                  onSubmit={handleAddComment}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={isEmptyHtml(newComment)}
                    className="cursor-pointer"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-4 border-t shrink-0 bg-muted/20">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
