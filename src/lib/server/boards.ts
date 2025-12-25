import fs from 'fs/promises';
import path from 'path';
import { KANBAN_DIR, CONFIG_FILE, DEFAULT_CONFIG, TICKETS_DIR } from '../constants';
import { KanbanConfigSchema } from '../schemas';
import type { Board, KanbanConfig, Priority, User } from '../types';

/**
 * Ensure the .kanban directory exists
 */
export async function ensureKanbanDir(): Promise<void> {
  try {
    await fs.mkdir(KANBAN_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Ensure the tickets directory for a board exists
 */
export async function ensureTicketsDir(boardSlug: string): Promise<void> {
  const dir = path.join(TICKETS_DIR, boardSlug);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Initialize the config file if it doesn't exist
 */
export async function initializeConfig(): Promise<KanbanConfig> {
  await ensureKanbanDir();
  
  try {
    await fs.access(CONFIG_FILE);
    // File exists, read it
    return await readConfig();
  } catch {
    // File doesn't exist, create default
    await writeConfig(DEFAULT_CONFIG);
    // Also create the tickets folder for the default board
    await ensureTicketsDir('main');
    return DEFAULT_CONFIG;
  }
}

/**
 * Read the kanban configuration
 */
export async function readConfig(): Promise<KanbanConfig> {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    const data = JSON.parse(content);
    return KanbanConfigSchema.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return default
    console.error('Error reading config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Write the kanban configuration
 */
export async function writeConfig(config: KanbanConfig): Promise<void> {
  await ensureKanbanDir();
  const validated = KanbanConfigSchema.parse(config);
  await fs.writeFile(CONFIG_FILE, JSON.stringify(validated, null, 2), 'utf-8');
}

/**
 * Get a specific board by ID
 */
export async function getBoardById(id: string): Promise<Board | undefined> {
  const config = await readConfig();
  return config.boards.find(b => b.id === id);
}

/**
 * Get a specific board by slug
 */
export async function getBoardBySlug(slug: string): Promise<Board | undefined> {
  const config = await readConfig();
  return config.boards.find(b => b.slug === slug);
}

/**
 * Create a new board
 */
export async function createBoard(name: string, slug: string, columns?: { id: string; name: string }[]): Promise<Board> {
  const config = await readConfig();
  
  // Check if slug already exists
  if (config.boards.some(b => b.slug === slug)) {
    throw new Error(`Board with slug "${slug}" already exists`);
  }
  
  const newBoard: Board = {
    id: `board_${Date.now()}`,
    name,
    slug,
    columns: columns || [
      { id: 'backlog', name: 'Backlog' },
      { id: 'in-progress', name: 'In Progress' },
      { id: 'review', name: 'Review' },
      { id: 'done', name: 'Done' },
    ],
  };
  
  config.boards.push(newBoard);
  await writeConfig(config);
  await ensureTicketsDir(slug);
  
  return newBoard;
}

/**
 * Update a board
 */
export async function updateBoard(id: string, updates: { name?: string; columns?: { id: string; name: string }[] }): Promise<Board> {
  const config = await readConfig();
  const boardIndex = config.boards.findIndex(b => b.id === id);
  
  if (boardIndex === -1) {
    throw new Error(`Board with id "${id}" not found`);
  }
  
  const board = config.boards[boardIndex];
  
  if (updates.name) {
    board.name = updates.name;
  }
  
  if (updates.columns) {
    board.columns = updates.columns;
  }
  
  config.boards[boardIndex] = board;
  await writeConfig(config);
  
  return board;
}

/**
 * Delete a board
 */
export async function deleteBoard(id: string): Promise<void> {
  const config = await readConfig();
  const boardIndex = config.boards.findIndex(b => b.id === id);
  
  if (boardIndex === -1) {
    throw new Error(`Board with id "${id}" not found`);
  }
  
  config.boards.splice(boardIndex, 1);
  await writeConfig(config);
  
  // Note: We don't delete the tickets folder to prevent data loss
}

/**
 * Update priorities
 */
export async function updatePriorities(priorities: Priority[]): Promise<void> {
  const config = await readConfig();
  config.priorities = priorities;
  await writeConfig(config);
}

/**
 * Update users
 */
export async function updateUsers(users: User[]): Promise<void> {
  const config = await readConfig();
  config.users = users;
  await writeConfig(config);
}
