// Type definitions for the Kanban board

export interface Column {
  id: string;
  name: string;
}

export interface Priority {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Board {
  id: string;
  name: string;
  slug: string;
  columns: Column[];
}

export interface KanbanConfig {
  boards: Board[];
  priorities: Priority[];
  users: User[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  board: string;
  title: string;
  status: string;
  owner?: string;
  priority?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  body?: string;
  comments?: Comment[];
  // Internal: the filename for this ticket
  _filename?: string;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: number;
  untracked: number;
  staged: number;
  hasChanges: boolean;
  files: GitFileStatus[];
}

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged';
}

export interface GitOperationResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  pulled?: boolean;
  committed?: boolean;
  pushed?: boolean;
  error?: string;
}
