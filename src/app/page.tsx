'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { KanbanBoard } from '@/components/kanban-board';
import { GitControls } from '@/components/git-controls';
import { ThemeToggle } from '@/components/theme-toggle';
import { useBoards } from '@/lib/hooks/use-boards';
import { useTickets } from '@/lib/hooks/use-tickets';
import { useGit } from '@/lib/hooks/use-git';
import type { Board, Column } from '@/lib/types';
import { Loader2, LayoutGrid } from 'lucide-react';

export default function Home() {
  const { boards, priorities, users, loading: boardsLoading, createBoard, deleteBoard, updateBoard } = useBoards();
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  
  const { tickets, loading: ticketsLoading, createTicket, updateTicket, deleteTicket, refresh: refreshTickets } = useTickets(selectedBoard?.slug ?? null);
  const git = useGit();

  // Auto-select first board
  useEffect(() => {
    if (boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0]);
    }
    // Update selected board if it changed
    if (selectedBoard) {
      const updated = boards.find(b => b.id === selectedBoard.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedBoard)) {
        setSelectedBoard(updated);
      }
    }
  }, [boards, selectedBoard]);

  const handleCreateBoard = async (name: string) => {
    await createBoard(name);
  };

  const handleDeleteBoard = async (id: string) => {
    await deleteBoard(id);
    if (selectedBoard?.id === id) {
      setSelectedBoard(boards.find(b => b.id !== id) || null);
    }
  };

  const handleRenameBoard = async (id: string, name: string) => {
    await updateBoard(id, { name });
  };

  const handleUpdateBoard = async (updates: { columns?: Column[]; name?: string }) => {
    if (!selectedBoard) return;
    await updateBoard(selectedBoard.id, updates);
    await refreshTickets();
  };

  const handleCreateTicket = async (data: {
    title: string;
    status: string;
    owner?: string;
    priority?: string;
    body?: string;
  }) => {
    await createTicket(data);
  };

  const handleUpdateTicket = async (
    ticketId: string,
    updates: {
      status?: string;
      title?: string;
      owner?: string | null;
      priority?: string | null;
      body?: string;
    }
  ) => {
    await updateTicket(ticketId, updates);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    await deleteTicket(ticketId);
  };

  if (boardsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        boards={boards}
        selectedBoard={selectedBoard}
        onSelectBoard={setSelectedBoard}
        onCreateBoard={handleCreateBoard}
        onRenameBoard={handleRenameBoard}
        onDeleteBoard={handleDeleteBoard}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
          <GitControls status={git.status} />
          <ThemeToggle />
        </div>
        
        {selectedBoard ? (
          ticketsLoading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <KanbanBoard
              board={selectedBoard}
              tickets={tickets}
              priorities={priorities}
              users={users}
              onUpdateTicket={handleUpdateTicket}
              onCreateTicket={handleCreateTicket}
              onDeleteTicket={handleDeleteTicket}
              onUpdateBoard={handleUpdateBoard}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
            <LayoutGrid className="w-16 h-16 mb-4" />
            <p className="text-lg">Select or create a board to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
