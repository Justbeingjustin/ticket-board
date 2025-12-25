import { z } from 'zod';

export const ColumnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const PrioritySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
});

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().optional(),
});

export const BoardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  columns: z.array(ColumnSchema).min(1),
});

export const KanbanConfigSchema = z.object({
  boards: z.array(BoardSchema),
  priorities: z.array(PrioritySchema),
  users: z.array(UserSchema),
});

export const CreateBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes').optional(),
  columns: z.array(ColumnSchema).optional(),
});

export const UpdateBoardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  columns: z.array(ColumnSchema).optional(),
});

export const DeleteBoardSchema = z.object({
  id: z.string().min(1),
});

export const CommentSchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  text: z.string().min(1),
  createdAt: z.string(),
});

export const TicketSchema = z.object({
  id: z.string().min(1),
  board: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  owner: z.string().optional(),
  priority: z.string().optional(),
  order: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  body: z.string().optional(),
  comments: z.array(CommentSchema).optional(),
});

export const CreateTicketSchema = z.object({
  board: z.string().min(1),
  title: z.string().min(1, 'Title is required'),
  status: z.string().min(1),
  owner: z.string().optional(),
  priority: z.string().min(1, 'Priority is required'),
  body: z.string().optional(),
});

export const UpdateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  owner: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  body: z.string().optional(),
  order: z.number().optional(),
  comments: z.array(CommentSchema).optional(),
});

export const UpdateConfigSchema = z.object({
  priorities: z.array(PrioritySchema).optional(),
  users: z.array(UserSchema).optional(),
});

export type CreateBoardInput = z.infer<typeof CreateBoardSchema>;
export type UpdateBoardInput = z.infer<typeof UpdateBoardSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
