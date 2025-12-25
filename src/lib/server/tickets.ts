import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { TICKETS_DIR } from '../constants';
import { ensureTicketsDir, getBoardBySlug } from './boards';
import type { Ticket } from '../types';

/**
 * Generate a ticket ID
 */
export function generateTicketId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `T-${timestamp}${random}`;
}

/**
 * Generate a slug from a title
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Generate filename for a ticket
 */
export function getTicketFilename(id: string, title: string): string {
  return `${id}-${slugify(title)}.md`;
}

/**
 * Parse a ticket file
 */
export function parseTicketFile(content: string, filename: string): Ticket {
  const { data, content: body } = matter(content);
  
  return {
    id: data.id,
    board: data.board,
    title: data.title,
    status: data.status,
    owner: data.owner,
    priority: data.priority,
    order: data.order,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    body: body.trim(),
    comments: data.comments || [],
    _filename: filename,
  };
}

/**
 * Serialize a ticket to markdown with frontmatter
 */
export function serializeTicket(ticket: Ticket): string {
  const frontmatter: Record<string, unknown> = {
    id: ticket.id,
    board: ticket.board,
    title: ticket.title,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
  
  if (ticket.owner) frontmatter.owner = ticket.owner;
  if (ticket.priority) frontmatter.priority = ticket.priority;
  if (ticket.order !== undefined) frontmatter.order = ticket.order;
  if (ticket.comments && ticket.comments.length > 0) frontmatter.comments = ticket.comments;
  
  const body = ticket.body || '';
  
  return matter.stringify(body, frontmatter);
}

/**
 * Get all tickets for a board
 */
export async function getTicketsForBoard(boardSlug: string): Promise<Ticket[]> {
  const board = await getBoardBySlug(boardSlug);
  if (!board) {
    throw new Error(`Board "${boardSlug}" not found`);
  }
  
  await ensureTicketsDir(boardSlug);
  const ticketsPath = path.join(TICKETS_DIR, boardSlug);
  
  try {
    const files = await fs.readdir(ticketsPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const tickets: Ticket[] = [];
    
    for (const file of mdFiles) {
      try {
        const content = await fs.readFile(path.join(ticketsPath, file), 'utf-8');
        const ticket = parseTicketFile(content, file);
        tickets.push(ticket);
      } catch (error) {
        console.error(`Error parsing ticket file ${file}:`, error);
      }
    }
    
    return tickets;
  } catch (error) {
    console.error(`Error reading tickets directory:`, error);
    return [];
  }
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(boardSlug: string, ticketId: string): Promise<Ticket | null> {
  const tickets = await getTicketsForBoard(boardSlug);
  return tickets.find(t => t.id === ticketId) || null;
}

/**
 * Create a new ticket
 */
export async function createTicket(data: {
  board: string;
  title: string;
  status: string;
  owner?: string;
  priority?: string;
  body?: string;
}): Promise<Ticket> {
  const board = await getBoardBySlug(data.board);
  if (!board) {
    throw new Error(`Board "${data.board}" not found`);
  }
  
  // Validate status matches a column
  if (!board.columns.some(c => c.id === data.status)) {
    throw new Error(`Invalid status "${data.status}" for board "${data.board}"`);
  }
  
  await ensureTicketsDir(data.board);
  
  const now = new Date().toISOString();
  const id = generateTicketId();
  
  const ticket: Ticket = {
    id,
    board: data.board,
    title: data.title,
    status: data.status,
    owner: data.owner,
    priority: data.priority,
    createdAt: now,
    updatedAt: now,
    body: data.body,
  };
  
  const filename = getTicketFilename(id, data.title);
  const filepath = path.join(TICKETS_DIR, data.board, filename);
  const content = serializeTicket(ticket);
  
  await fs.writeFile(filepath, content, 'utf-8');
  
  ticket._filename = filename;
  return ticket;
}

/**
 * Update an existing ticket
 */
export async function updateTicket(
  boardSlug: string,
  ticketId: string,
  updates: {
    title?: string;
    status?: string;
    owner?: string | null;
    priority?: string | null;
    body?: string;
    order?: number;
    comments?: { id: string; author: string; text: string; createdAt: string }[];
  }
): Promise<Ticket> {
  const ticket = await getTicketById(boardSlug, ticketId);
  if (!ticket) {
    throw new Error(`Ticket "${ticketId}" not found in board "${boardSlug}"`);
  }
  
  const board = await getBoardBySlug(boardSlug);
  if (!board) {
    throw new Error(`Board "${boardSlug}" not found`);
  }
  
  // Validate status if being updated
  if (updates.status && !board.columns.some(c => c.id === updates.status)) {
    throw new Error(`Invalid status "${updates.status}" for board "${boardSlug}"`);
  }
  
  // Update fields
  if (updates.title !== undefined) ticket.title = updates.title;
  if (updates.status !== undefined) ticket.status = updates.status;
  if (updates.owner !== undefined) ticket.owner = updates.owner || undefined;
  if (updates.priority !== undefined) ticket.priority = updates.priority || undefined;
  if (updates.body !== undefined) ticket.body = updates.body;
  if (updates.order !== undefined) ticket.order = updates.order;
  if (updates.comments !== undefined) ticket.comments = updates.comments;
  
  ticket.updatedAt = new Date().toISOString();
  
  // If title changed, we might need to rename the file
  const oldFilename = ticket._filename!;
  const newFilename = getTicketFilename(ticket.id, ticket.title);
  
  const oldFilepath = path.join(TICKETS_DIR, boardSlug, oldFilename);
  const newFilepath = path.join(TICKETS_DIR, boardSlug, newFilename);
  
  const content = serializeTicket(ticket);
  
  // Write to new file first
  await fs.writeFile(newFilepath, content, 'utf-8');
  
  // Delete old file if different
  if (oldFilename !== newFilename) {
    try {
      await fs.unlink(oldFilepath);
    } catch (error) {
      // Old file might not exist
    }
  }
  
  ticket._filename = newFilename;
  return ticket;
}

/**
 * Delete a ticket
 */
export async function deleteTicket(boardSlug: string, ticketId: string): Promise<void> {
  const ticket = await getTicketById(boardSlug, ticketId);
  if (!ticket) {
    throw new Error(`Ticket "${ticketId}" not found in board "${boardSlug}"`);
  }
  
  const filepath = path.join(TICKETS_DIR, boardSlug, ticket._filename!);
  await fs.unlink(filepath);
}

/**
 * Move tickets to a new status when a column is deleted
 */
export async function moveTicketsToColumn(
  boardSlug: string,
  fromStatus: string,
  toStatus: string
): Promise<void> {
  const tickets = await getTicketsForBoard(boardSlug);
  const ticketsToMove = tickets.filter(t => t.status === fromStatus);
  
  for (const ticket of ticketsToMove) {
    await updateTicket(boardSlug, ticket.id, { status: toStatus });
  }
}
