'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kanban-snow-enabled';

export function useSnow() {
  const [snowEnabled, setSnowEnabledState] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setSnowEnabledState(stored === 'true');
    }
  }, []);

  const setSnowEnabled = useCallback((enabled: boolean) => {
    setSnowEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    // Dispatch custom event so Snowflakes component can update
    window.dispatchEvent(new CustomEvent('snow-setting-changed', { detail: enabled }));
  }, []);

  return {
    snowEnabled,
    setSnowEnabled,
    mounted,
  };
}

