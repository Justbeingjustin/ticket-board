import { NextRequest, NextResponse } from 'next/server';
import { initializeConfig, readConfig, createBoard, updateBoard, deleteBoard, updatePriorities, updateUsers } from '@/lib/server/boards';
import { moveTicketsToColumn } from '@/lib/server/tickets';
import { CreateBoardSchema, UpdateBoardSchema, DeleteBoardSchema, UpdateConfigSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const config = await initializeConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const data = CreateBoardSchema.parse(body);
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const board = await createBoard(data.name, slug, data.columns);
      return NextResponse.json(board);
    }

    if (action === 'update') {
      const data = UpdateBoardSchema.parse(body);
      const config = await readConfig();
      const existingBoard = config.boards.find(b => b.id === data.id);
      
      if (!existingBoard) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
      }

      // If columns are being updated and a column is removed, move tickets
      if (data.columns) {
        const removedColumns = existingBoard.columns.filter(
          c => !data.columns!.some(nc => nc.id === c.id)
        );
        
        for (const removed of removedColumns) {
          const firstColumn = data.columns[0];
          if (firstColumn) {
            await moveTicketsToColumn(existingBoard.slug, removed.id, firstColumn.id);
          }
        }
      }

      const board = await updateBoard(data.id, {
        name: data.name,
        columns: data.columns,
      });
      return NextResponse.json(board);
    }

    if (action === 'delete') {
      const data = DeleteBoardSchema.parse(body);
      await deleteBoard(data.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'updateConfig') {
      const data = UpdateConfigSchema.parse(body);
      if (data.priorities) {
        await updatePriorities(data.priorities);
      }
      if (data.users) {
        await updateUsers(data.users);
      }
      const config = await readConfig();
      return NextResponse.json(config);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
