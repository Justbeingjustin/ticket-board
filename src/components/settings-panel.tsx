'use client';

import { Settings, Check, Sun, Moon, Monitor, Sparkles, Users, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useColorTheme, colorThemes, type ColorTheme } from '@/lib/hooks/use-color-theme';
import { useHolidayEffects } from '@/lib/hooks/use-holiday-effects';
import { getHolidayInfo } from '@/components/holiday-effects';
import { useBoards } from '@/lib/hooks/use-boards';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';
import { UserAvatar } from './user-avatar';

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme, mounted } = useColorTheme();
  const { holidayEffectsEnabled, setHolidayEffectsEnabled, mounted: holidayMounted } = useHolidayEffects();
  const { users, updateConfig, refresh } = useBoards();
  const [themeMounted, setThemeMounted] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState({ type: null as string | null, emoji: '', name: '' });
  
  // User management state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserName, setEditingUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
    setHolidayInfo(getHolidayInfo());
  }, []);

  const appearanceOptions = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor },
  ];

  const handleAddUser = async () => {
    if (!newUserName.trim()) return;
    
    setIsSaving(true);
    try {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: newUserName.trim(),
      };
      await updateConfig({ users: [...users, newUser] });
      setNewUserName('');
      setIsAddingUser(false);
      await refresh();
    } catch (error) {
      console.error('Failed to add user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = async (userId: string) => {
    if (!editingUserName.trim()) return;
    
    setIsSaving(true);
    try {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, name: editingUserName.trim() } : u
      );
      await updateConfig({ users: updatedUsers });
      setEditingUserId(null);
      setEditingUserName('');
      await refresh();
    } catch (error) {
      console.error('Failed to edit user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsSaving(true);
    try {
      const updatedUsers = users.filter(u => u.id !== userId);
      await updateConfig({ users: updatedUsers });
      await refresh();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditingUserName(user.name);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditingUserName('');
  };

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
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your kanban board appearance and manage users.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
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

            {/* Holiday Effects Section */}
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

            <Separator />

            {/* Users Management Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Users</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingUser(true)}
                  className="h-7 text-xs cursor-pointer"
                  disabled={isAddingUser}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add User
                </Button>
              </div>

              {/* Add User Form */}
              {isAddingUser && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5">
                  <Input
                    placeholder="Enter user name..."
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddUser();
                      if (e.key === 'Escape') {
                        setIsAddingUser(false);
                        setNewUserName('');
                      }
                    }}
                    className="h-8 text-sm"
                    autoFocus
                    disabled={isSaving}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddUser}
                    disabled={!newUserName.trim() || isSaving}
                    className="h-8 px-2 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingUser(false);
                      setNewUserName('');
                    }}
                    disabled={isSaving}
                    className="h-8 px-2 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* Users List */}
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users yet. Add your first user!
                  </p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-all',
                        editingUserId === user.id
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      {editingUserId === user.id ? (
                        // Editing mode
                        <div className="flex items-center gap-2 flex-1">
                          <UserAvatar user={user} size="sm" />
                          <Input
                            value={editingUserName}
                            onChange={(e) => setEditingUserName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditUser(user.id);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            className="h-7 text-sm flex-1"
                            autoFocus
                            disabled={isSaving}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleEditUser(user.id)}
                            disabled={!editingUserName.trim() || isSaving}
                            className="h-7 px-2 cursor-pointer"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEditing}
                            disabled={isSaving}
                            className="h-7 px-2 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        // Display mode
                        <>
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} size="sm" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.id}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(user)}
                              className="h-7 w-7 p-0 cursor-pointer hover:bg-muted"
                              disabled={isSaving}
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-7 w-7 p-0 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                              disabled={isSaving}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
