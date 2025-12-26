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

export function Snowflakes() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Generate snowflakes on client-side only
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
  }, []);

  if (snowflakes.length === 0) return null;

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

