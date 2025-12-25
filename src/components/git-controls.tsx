'use client';

import { GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { GitStatus } from '@/lib/types';

interface GitControlsProps {
  status: GitStatus;
}

export function GitControls({ status }: GitControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Branch info */}
      <div className="flex items-center gap-2 text-sm">
        <GitBranch className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-foreground">{status.branch}</span>
      </div>

      {/* Status badges */}
      {status.behind > 0 && (
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
          ↓{status.behind}
        </Badge>
      )}
      {status.ahead > 0 && (
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
          ↑{status.ahead}
        </Badge>
      )}
    </div>
  );
}
