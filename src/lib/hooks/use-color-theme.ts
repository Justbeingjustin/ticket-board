'use client';

import { useState, useEffect, useCallback } from 'react';

export type ColorTheme = 'green' | 'blue' | 'purple' | 'rose' | 'orange' | 'amber' | 'teal';

export interface ColorThemeOption {
  id: ColorTheme;
  name: string;
  color: string;
}

export const colorThemes: ColorThemeOption[] = [
  { id: 'green', name: 'Green', color: 'oklch(0.55 0.2 145)' },
  { id: 'blue', name: 'Blue', color: 'oklch(0.55 0.2 240)' },
  { id: 'purple', name: 'Purple', color: 'oklch(0.55 0.2 290)' },
  { id: 'rose', name: 'Rose', color: 'oklch(0.55 0.2 350)' },
  { id: 'orange', name: 'Orange', color: 'oklch(0.6 0.2 45)' },
  { id: 'amber', name: 'Amber', color: 'oklch(0.65 0.2 75)' },
  { id: 'teal', name: 'Teal', color: 'oklch(0.55 0.15 180)' },
];

const STORAGE_KEY = 'kanban-color-theme';

export function useColorTheme() {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('green');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as ColorTheme | null;
    if (stored && colorThemes.some(t => t.id === stored)) {
      setColorThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  const applyTheme = useCallback((theme: ColorTheme) => {
    const root = document.documentElement;
    // Remove all theme classes
    colorThemes.forEach(t => {
      if (t.id !== 'green') {
        root.classList.remove(`theme-${t.id}`);
      }
    });
    // Add new theme class (green is default, no class needed)
    if (theme !== 'green') {
      root.classList.add(`theme-${theme}`);
    }
  }, []);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }, [applyTheme]);

  return {
    colorTheme,
    setColorTheme,
    colorThemes,
    mounted,
  };
}

