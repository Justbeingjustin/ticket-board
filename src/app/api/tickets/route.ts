import { NextRequest, NextResponse } from 'next/server';
import { getTicketsForBoard, createTicket } from '@/lib/server/tickets';
import { CreateTicketSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const board = searchParams.get('board');

    if (!board) {
      return NextResponse.json(
        { error: 'Board slug is required' },
        { status: 400 }
      );
    }

    const tickets = await getTicketsForBoard(board);
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error reading tickets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateTicketSchema.parse(body);
    const ticket = await createTicket(data);
    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

