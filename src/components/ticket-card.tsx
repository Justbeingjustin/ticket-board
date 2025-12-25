'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from './user-avatar';
import type { Ticket, Priority, User as UserType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  priorities: Priority[];
  users: UserType[];
  onClick: () => void;
  isDragging?: boolean;
}

export function TicketCard({ ticket, priorities, users, onClick, isDragging }: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragging = isDragging || isSortableDragging;
  const priority = priorities.find(p => p.id === ticket.priority);
  const owner = users.find(u => u.id === ticket.owner);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-200 group',
        'bg-card border-border hover:border-primary/50',
        'hover:shadow-lg hover:shadow-primary/5',
        dragging && 'opacity-50 rotate-1 scale-105 shadow-xl border-primary'
      )}
    >
      <CardContent className="p-3">
        {/* Title */}
        <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-2">
          {ticket.title}
        </h4>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {/* Priority text */}
          {priority && (
            <span className="font-medium" style={{ color: priority.color }}>
              {priority.name}
            </span>
          )}
          {!priority && <span></span>}
          
          {/* Owner Avatar */}
          <UserAvatar user={owner} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}

// A simplified card for drag overlay
export function TicketCardOverlay({ ticket, priorities }: { ticket: Ticket; priorities: Priority[] }) {
  const priority = priorities.find(p => p.id === ticket.priority);

  return (
    <Card className="cursor-grabbing bg-card border-primary shadow-xl rotate-2 scale-105 w-72">
      <CardContent className="p-3">
        <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-2">
          {ticket.title}
        </h4>
        {priority && (
          <span className="text-xs font-medium" style={{ color: priority.color }}>
            {priority.name}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
