'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GitStatus, SyncResult } from '../types';

const defaultStatus: GitStatus = {
  branch: 'unknown',
  ahead: 0,
  behind: 0,
  modified: 0,
  untracked: 0,
  staged: 0,
  hasChanges: false,
  files: [],
};

export function useGit() {
  const [status, setStatus] = useState<GitStatus>(defaultStatus);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/git/status');
      if (!res.ok) {
        if (res.status === 400) {
          // Not a git repo
          setStatus(defaultStatus);
          return;
        }
        throw new Error('Failed to fetch git status');
      }
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch git status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll for status every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const sync = useCallback(async (): Promise<SyncResult> => {
    try {
      setSyncing(true);
      const res = await fetch('/api/git/sync', { method: 'POST' });
      const result = await res.json();
      await fetchStatus();
      return result;
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Sync failed' };
    } finally {
      setSyncing(false);
    }
  }, [fetchStatus]);

  return {
    status,
    loading,
    syncing,
    error,
    refresh: fetchStatus,
    sync,
  };
}
