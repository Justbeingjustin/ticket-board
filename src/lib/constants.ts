import path from 'path';

// Get the repo root directory (where the app runs from)
export const REPO_ROOT = process.cwd();

// Kanban config directory
export const KANBAN_DIR = path.join(REPO_ROOT, '.kanban');
export const CONFIG_FILE = path.join(KANBAN_DIR, 'config.json');

// Tickets directory
export const TICKETS_DIR = path.join(REPO_ROOT, 'tickets');

// Default configuration
export const DEFAULT_CONFIG = {
  boards: [
    {
      id: 'board_1',
      name: 'Main',
      slug: 'main',
      columns: [
        { id: 'backlog', name: 'Backlog' },
        { id: 'in-progress', name: 'In Progress' },
        { id: 'review', name: 'Review' },
        { id: 'done', name: 'Done' },
      ],
    },
  ],
  priorities: [
    { id: 'critical', name: 'Critical', color: '#ef4444' },
    { id: 'high', name: 'High', color: '#f97316' },
    { id: 'medium', name: 'Medium', color: '#eab308' },
    { id: 'low', name: 'Low', color: '#3b82f6' },
  ],
  users: [
    { id: 'user_1', name: 'Justin' },
  ],
};

// Git paths to track
export const GIT_TRACKED_PATHS = ['.kanban', 'tickets'];
