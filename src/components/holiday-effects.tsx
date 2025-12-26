"use client";

import { useEffect, useState } from "react";

type HolidayType = 'christmas' | 'easter' | 'halloween' | null;

interface Particle {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
  drift: number;
}

interface HolidayConfig {
  type: HolidayType;
  emoji: string;
  name: string;
}

const STORAGE_KEY = 'kanban-holiday-effects-enabled';

// Calculate Easter date using the Anonymous Gregorian algorithm
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getCurrentHoliday(): HolidayConfig {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();
  const year = now.getFullYear();

  // Christmas: December 15 - January 5
  if ((month === 11 && day >= 15) || (month === 0 && day <= 5)) {
    return { type: 'christmas', emoji: '❄', name: 'Snowflakes' };
  }

  // Halloween: October 15 - November 2
  if ((month === 9 && day >= 15) || (month === 10 && day <= 2)) {
    return { type: 'halloween', emoji: '🎃', name: 'Pumpkins' };
  }

  // Easter: 2 weeks before and 1 week after Easter Sunday
  const easter = getEasterDate(year);
  const twoWeeksBefore = new Date(easter);
  twoWeeksBefore.setDate(easter.getDate() - 14);
  const oneWeekAfter = new Date(easter);
  oneWeekAfter.setDate(easter.getDate() + 7);
  
  if (now >= twoWeeksBefore && now <= oneWeekAfter) {
    return { type: 'easter', emoji: '🥚', name: 'Easter Eggs' };
  }

  // Default to no effect outside holiday seasons (but still allow snowflakes if enabled manually)
  // For demo purposes, let's default to the nearest upcoming holiday
  return { type: 'christmas', emoji: '❄', name: 'Snowflakes' };
}

export function getHolidayInfo(): HolidayConfig {
  return getCurrentHoliday();
}

export function HolidayEffects() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [holiday, setHoliday] = useState<HolidayConfig>({ type: null, emoji: '', name: '' });

  useEffect(() => {
    setMounted(true);
    setHoliday(getCurrentHoliday());
    
    // Read initial setting from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === 'true');
    }

    // Listen for setting changes from the settings panel
    const handleSettingChange = (event: CustomEvent<boolean>) => {
      setEnabled(event.detail);
    };

    window.addEventListener('holiday-effects-setting-changed', handleSettingChange as EventListener);
    return () => {
      window.removeEventListener('holiday-effects-setting-changed', handleSettingChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !enabled || !holiday.type) {
      setParticles([]);
      return;
    }

    // Generate particles on client-side only when enabled
    const particleCount = holiday.type === 'halloween' ? 30 : 50; // Fewer pumpkins, they're bigger
    
    const items: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: holiday.type === 'halloween' ? 10 + Math.random() * 15 : 8 + Math.random() * 12,
      animationDelay: Math.random() * -20,
      size: holiday.type === 'halloween' 
        ? 16 + Math.random() * 12  // Bigger pumpkins
        : holiday.type === 'easter'
          ? 10 + Math.random() * 10  // Medium eggs
          : 4 + Math.random() * 12,  // Small snowflakes
      opacity: 0.3 + Math.random() * 0.7,
      drift: -20 + Math.random() * 40,
    }));
    setParticles(items);
  }, [mounted, enabled, holiday.type]);

  if (!mounted || !enabled || particles.length === 0 || !holiday.type) return null;

  return (
    <div className="holiday-effects-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`holiday-particle holiday-${holiday.type}`}
          style={{
            left: `${particle.left}%`,
            animationDuration: `${particle.animationDuration}s`,
            animationDelay: `${particle.animationDelay}s`,
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
            "--drift": `${particle.drift}px`,
          } as React.CSSProperties}
        >
          {holiday.emoji}
        </div>
      ))}
    </div>
  );
}

