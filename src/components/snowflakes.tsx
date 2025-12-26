"use client";

import { useEffect, useState } from "react";

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
  drift: number;
}

const STORAGE_KEY = 'kanban-snow-enabled';

export function Snowflakes() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read initial setting from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === 'true');
    }

    // Listen for setting changes from the settings panel
    const handleSettingChange = (event: CustomEvent<boolean>) => {
      setEnabled(event.detail);
    };

    window.addEventListener('snow-setting-changed', handleSettingChange as EventListener);
    return () => {
      window.removeEventListener('snow-setting-changed', handleSettingChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !enabled) {
      setSnowflakes([]);
      return;
    }

    // Generate snowflakes on client-side only when enabled
    const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 8 + Math.random() * 12,
      animationDelay: Math.random() * -20,
      size: 4 + Math.random() * 12,
      opacity: 0.3 + Math.random() * 0.7,
      drift: -20 + Math.random() * 40,
    }));
    setSnowflakes(flakes);
  }, [mounted, enabled]);

  if (!mounted || !enabled || snowflakes.length === 0) return null;

  return (
    <div className="snowflakes-container">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            "--drift": `${flake.drift}px`,
          } as React.CSSProperties}
        >
          ❄
        </div>
      ))}
    </div>
  );
}
