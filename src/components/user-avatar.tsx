'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: User | undefined;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5 text-[10px]',
  md: 'h-7 w-7 text-xs',
  lg: 'h-10 w-10 text-sm',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({ user, size = 'md', showName = false, className }: UserAvatarProps) {
  if (!user) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Avatar className={cn(sizeClasses[size], 'border border-border')}>
          <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
        </Avatar>
        {showName && <span className="text-sm text-muted-foreground">Unassigned</span>}
      </div>
    );
  }

  const initials = getInitials(user.name);
  const colorClass = getColorFromName(user.name);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Avatar className={cn(sizeClasses[size], 'border border-border')}>
        {user.avatar && (
          <AvatarImage src={user.avatar} alt={user.name} />
        )}
        <AvatarFallback className={cn(colorClass, 'text-white font-medium')}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {showName && <span className="text-sm">{user.name}</span>}
    </div>
  );
}

