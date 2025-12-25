'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Ticket } from '../types';

export function useTickets(boardSlug: string | null) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!boardSlug) {
      setTickets([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/tickets?board=${encodeURIComponent(boardSlug)}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data.tickets);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [boardSlug]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = useCallback(async (data: {
    title: string;
    status: string;
    owner?: string;
    priority?: string;
    body?: string;
  }) => {
    if (!boardSlug) throw new Error('No board selected');

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, board: boardSlug }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create ticket');
    }
    await fetchTickets();
    return res.json();
  }, [boardSlug, fetchTickets]);

  const updateTicket = useCallback(async (ticketId: string, updates: {
    title?: string;
    status?: string;
    owner?: string | null;
    priority?: string | null;
    body?: string;
    order?: number;
    comments?: { id: string; author: string; text: string; createdAt: string }[];
  }) => {
    if (!boardSlug) throw new Error('No board selected');

    const res = await fetch(`/api/tickets/${ticketId}?board=${encodeURIComponent(boardSlug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update ticket');
    }
    await fetchTickets();
    return res.json();
  }, [boardSlug, fetchTickets]);

  const deleteTicket = useCallback(async (ticketId: string) => {
    if (!boardSlug) throw new Error('No board selected');

    const res = await fetch(`/api/tickets/${ticketId}?board=${encodeURIComponent(boardSlug)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete ticket');
    }
    await fetchTickets();
  }, [boardSlug, fetchTickets]);

  return {
    tickets,
    loading,
    error,
    refresh: fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}

