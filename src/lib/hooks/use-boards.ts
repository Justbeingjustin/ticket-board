'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Board, KanbanConfig, Column, Priority, User } from '../types';

export function useBoards() {
  const [config, setConfig] = useState<KanbanConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error('Failed to fetch config');
      const data: KanbanConfig = await res.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const createBoard = useCallback(async (name: string, slug?: string, columns?: Column[]) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name, slug, columns }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create board');
    }
    await fetchConfig();
    return res.json();
  }, [fetchConfig]);

  const updateBoard = useCallback(async (id: string, updates: { name?: string; columns?: Column[] }) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, ...updates }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update board');
    }
    await fetchConfig();
    return res.json();
  }, [fetchConfig]);

  const deleteBoard = useCallback(async (id: string) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete board');
    }
    await fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (updates: { priorities?: Priority[]; users?: User[] }) => {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateConfig', ...updates }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update config');
    }
    await fetchConfig();
    return res.json();
  }, [fetchConfig]);

  return {
    boards: config?.boards || [],
    priorities: config?.priorities || [],
    users: config?.users || [],
    loading,
    error,
    refresh: fetchConfig,
    createBoard,
    updateBoard,
    deleteBoard,
    updateConfig,
  };
}
