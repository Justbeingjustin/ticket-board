'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { Sparkles, Search, Columns, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TicketCard, TicketCardOverlay } from './ticket-card';
import { TicketDetail } from './ticket-detail';
import { CreateTicketModal } from './create-ticket-modal';
import { ColumnHeader } from './column-header';
import { ColumnManager } from './column-manager';
import type { Board, Ticket, Column, Priority, User, Comment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  board: Board;
  tickets: Ticket[];
  priorities: Priority[];
  users: User[];
  onUpdateTicket: (ticketId: string, updates: { status?: string; title?: string; owner?: string | null; priority?: string | null; body?: string; order?: number; comments?: Comment[] }) => Promise<void>;
  onCreateTicket: (data: { title: string; status: string; owner?: string; priority?: string; body?: string }) => Promise<void>;
  onDeleteTicket: (ticketId: string) => Promise<void>;
  onUpdateBoard: (updates: { columns?: Column[]; name?: string }) => Promise<void>;
}

interface DroppableColumnProps {
  column: Column;
  children: React.ReactNode;
}

function DroppableColumn({ column, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 min-h-[100px] p-2 rounded-b-lg transition-colors duration-200 overflow-y-auto',
        isOver ? 'bg-primary/10' : 'bg-muted/30'
      )}
    >
      {children}
    </div>
  );
}

interface SortableColumnProps {
  column: Column;
  ticketCount: number;
  isFirst: boolean;
  children: React.ReactNode;
  onAddTicket: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function SortableColumn({
  column,
  ticketCount,
  isFirst,
  children,
  onAddTicket,
  onRename,
  onDelete,
}: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `sortable-column-${column.id}`,
    data: { type: 'sortable-column', column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'w-72 flex flex-col bg-muted/50 rounded-lg border shrink-0 max-h-[calc(100vh-180px)]',
        isDragging && 'opacity-50'
      )}
    >
      <ColumnHeader
        column={column}
        ticketCount={ticketCount}
        isFirst={isFirst}
        onAddTicket={onAddTicket}
        onRename={onRename}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
      {children}
    </div>
  );
}

export function KanbanBoard({
  board,
  tickets,
  priorities,
  users,
  onUpdateTicket,
  onCreateTicket,
  onDeleteTicket,
  onUpdateBoard,
}: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<string | undefined>();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Filter tickets by search query
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const query = searchQuery.toLowerCase();
    return tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.body?.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
    );
  }, [tickets, searchQuery]);

  // Group and sort tickets by column
  const ticketsByColumn = useMemo(() => {
    const grouped: Record<string, Ticket[]> = {};
    for (const col of board.columns) {
      const columnTickets = filteredTickets
        .filter((t) => t.status === col.id)
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
      grouped[col.id] = columnTickets;
    }
    return grouped;
  }, [board.columns, filteredTickets]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);
    
    // Check if dragging a ticket
    if (!activeId.startsWith('sortable-column-')) {
      const ticket = tickets.find((t) => t.id === activeId);
      if (ticket) {
        setActiveTicket(ticket);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Handle column reordering
    if (activeId.startsWith('sortable-column-') && overId.startsWith('sortable-column-')) {
      const activeColId = activeId.replace('sortable-column-', '');
      const overColId = overId.replace('sortable-column-', '');
      
      if (activeColId !== overColId) {
        const activeIndex = board.columns.findIndex(c => c.id === activeColId);
        const overIndex = board.columns.findIndex(c => c.id === overColId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          const newColumns = arrayMove(board.columns, activeIndex, overIndex);
          await onUpdateBoard({ columns: newColumns });
        }
      }
      return;
    }

    // Handle ticket movement
    const ticketId = activeId;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    // Determine target column
    let targetColumnId: string | null = null;
    let targetIndex: number | null = null;

    // Dropped on a column
    if (overId.startsWith('column-')) {
      targetColumnId = overId.replace('column-', '');
      const columnTickets = ticketsByColumn[targetColumnId] || [];
      targetIndex = columnTickets.length; // Add to end
    }
    // Dropped on another ticket
    else {
      const targetTicket = tickets.find((t) => t.id === overId);
      if (targetTicket) {
        targetColumnId = targetTicket.status;
        const columnTickets = ticketsByColumn[targetColumnId] || [];
        targetIndex = columnTickets.findIndex(t => t.id === overId);
      }
    }

    if (!targetColumnId) return;

    // Calculate new order for the ticket
    const columnTickets = ticketsByColumn[targetColumnId] || [];
    const ticketInSameColumn = ticket.status === targetColumnId;
    
    // Remove the dragged ticket from consideration if in same column
    const otherTickets = ticketInSameColumn 
      ? columnTickets.filter(t => t.id !== ticketId)
      : columnTickets;

    let newOrder: number;
    
    if (targetIndex === null || targetIndex >= otherTickets.length) {
      // Add to end
      const lastOrder = otherTickets.length > 0 
        ? (otherTickets[otherTickets.length - 1].order ?? otherTickets.length - 1)
        : -1;
      newOrder = lastOrder + 1;
    } else if (targetIndex === 0) {
      // Add to beginning
      const firstOrder = otherTickets.length > 0 
        ? (otherTickets[0].order ?? 0)
        : 1;
      newOrder = firstOrder - 1;
    } else {
      // Insert between two tickets
      const prevOrder = otherTickets[targetIndex - 1].order ?? targetIndex - 1;
      const nextOrder = otherTickets[targetIndex].order ?? targetIndex;
      newOrder = (prevOrder + nextOrder) / 2;
    }

    // Only update if something changed
    if (ticket.status !== targetColumnId || ticket.order !== newOrder) {
      await onUpdateTicket(ticketId, { 
        status: targetColumnId,
        order: newOrder,
      });
    }
  };

  const handleRenameColumn = (columnId: string, newName: string) => {
    const newColumns = board.columns.map((c) =>
      c.id === columnId ? { ...c, name: newName } : c
    );
    onUpdateBoard({ columns: newColumns });
  };

  const handleDeleteColumn = (columnId: string) => {
    const newColumns = board.columns.filter((c) => c.id !== columnId);
    onUpdateBoard({ columns: newColumns });
  };

  const handleOpenCreateModal = (defaultStatus?: string) => {
    setCreateDefaultStatus(defaultStatus);
    setCreateModalOpen(true);
  };

  const handleSaveColumns = async (columns: Column[]) => {
    await onUpdateBoard({ columns });
  };

  // Refresh selected ticket when tickets update
  const currentSelectedTicket = selectedTicket 
    ? tickets.find(t => t.id === selectedTicket.id) || null
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-xl font-bold">{board.name}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-64 pl-9"
            />
          </div>
          <Button variant="destructive" onClick={() => handleOpenCreateModal()}>
            <Sparkles className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
          <Button variant="outline" onClick={() => setColumnManagerOpen(true)}>
            <Columns className="w-4 h-4 mr-2" />
            Columns
          </Button>
        </div>
      </div>

      {/* Board content */}
      <ScrollArea className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={board.columns.map(c => `sortable-column-${c.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-4 p-6 min-w-max">
              {board.columns.map((column, index) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  ticketCount={ticketsByColumn[column.id]?.length || 0}
                  isFirst={index === 0}
                  onAddTicket={() => handleOpenCreateModal(column.id)}
                  onRename={(name) => handleRenameColumn(column.id, name)}
                  onDelete={() => handleDeleteColumn(column.id)}
                >
                  <DroppableColumn column={column}>
                    <SortableContext
                      items={ticketsByColumn[column.id]?.map((t) => t.id) || []}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {ticketsByColumn[column.id]?.map((ticket) => (
                          <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            priorities={priorities}
                            users={users}
                            onClick={() => setSelectedTicket(ticket)}
                            isDragging={activeTicket?.id === ticket.id}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                </SortableColumn>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeTicket && <TicketCardOverlay ticket={activeTicket} priorities={priorities} />}
          </DragOverlay>
        </DndContext>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Create ticket modal */}
      <CreateTicketModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        columns={board.columns}
        priorities={priorities}
        users={users}
        defaultStatus={createDefaultStatus}
        onCreate={onCreateTicket}
      />

      {/* Ticket detail modal */}
      <TicketDetail
        ticket={currentSelectedTicket}
        columns={board.columns}
        priorities={priorities}
        users={users}
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onSave={async (updates) => {
          if (selectedTicket) {
            await onUpdateTicket(selectedTicket.id, updates);
          }
        }}
        onDelete={async () => {
          if (selectedTicket) {
            await onDeleteTicket(selectedTicket.id);
          }
        }}
      />

      {/* Column Manager */}
      <ColumnManager
        open={columnManagerOpen}
        onClose={() => setColumnManagerOpen(false)}
        columns={board.columns}
        onSave={handleSaveColumns}
      />
    </div>
  );
}
