'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kanban-holiday-effects-enabled';

export function useHolidayEffects() {
  const [holidayEffectsEnabled, setHolidayEffectsEnabledState] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setHolidayEffectsEnabledState(stored === 'true');
    }
  }, []);

  const setHolidayEffectsEnabled = useCallback((enabled: boolean) => {
    setHolidayEffectsEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    // Dispatch custom event so HolidayEffects component can update
    window.dispatchEvent(new CustomEvent('holiday-effects-setting-changed', { detail: enabled }));
  }, []);

  return {
    holidayEffectsEnabled,
    setHolidayEffectsEnabled,
    mounted,
  };
}

