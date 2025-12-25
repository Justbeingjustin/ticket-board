import { NextRequest, NextResponse } from 'next/server';
import { getTicketById, updateTicket, deleteTicket } from '@/lib/server/tickets';
import { UpdateTicketSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const board = searchParams.get('board');

    if (!board) {
      return NextResponse.json(
        { error: 'Board slug is required' },
        { status: 400 }
      );
    }

    const ticket = await getTicketById(board, id);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error reading ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read ticket' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const board = searchParams.get('board');

    if (!board) {
      return NextResponse.json(
        { error: 'Board slug is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = UpdateTicketSchema.parse(body);
    const ticket = await updateTicket(board, id, data);
    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const board = searchParams.get('board');

    if (!board) {
      return NextResponse.json(
        { error: 'Board slug is required' },
        { status: 400 }
      );
    }

    await deleteTicket(board, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}

