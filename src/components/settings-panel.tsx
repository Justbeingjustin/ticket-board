'use client';

import { Settings, Check, Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useColorTheme, colorThemes, type ColorTheme } from '@/lib/hooks/use-color-theme';
import { useHolidayEffects } from '@/lib/hooks/use-holiday-effects';
import { getHolidayInfo } from '@/components/holiday-effects';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme, mounted } = useColorTheme();
  const { holidayEffectsEnabled, setHolidayEffectsEnabled, mounted: holidayMounted } = useHolidayEffects();
  const [themeMounted, setThemeMounted] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState({ type: null as string | null, emoji: '', name: '' });

  useEffect(() => {
    setThemeMounted(true);
    setHolidayInfo(getHolidayInfo());
  }, []);

  const appearanceOptions = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor },
  ];

  if (!mounted || !themeMounted || !holidayMounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 cursor-pointer">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your kanban board appearance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appearance Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Appearance</Label>
            <div className="grid grid-cols-3 gap-2">
              {appearanceOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-xs font-medium', isSelected ? 'text-primary' : 'text-muted-foreground')}>
                      {option.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Color Theme Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Color Theme</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorThemes.map((themeOption) => {
                const isSelected = colorTheme === themeOption.id;
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => setColorTheme(themeOption.id as ColorTheme)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div
                      className="w-6 h-6 rounded-full shadow-sm"
                      style={{ backgroundColor: themeOption.color }}
                    />
                    <span className={cn('text-xs font-medium', isSelected ? 'text-primary' : 'text-muted-foreground')}>
                      {themeOption.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Effects Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Holiday Effects</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  holidayEffectsEnabled ? 'bg-primary/10' : 'bg-muted'
                )}>
                  <Sparkles className={cn(
                    'h-5 w-5',
                    holidayEffectsEnabled ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Holiday Effects</span>
                  <span className="text-xs text-muted-foreground">
                    {holidayInfo.type ? `Showing ${holidayInfo.name} ${holidayInfo.emoji}` : 'Seasonal falling particles'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setHolidayEffectsEnabled(!holidayEffectsEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
                  holidayEffectsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                    holidayEffectsEnabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
