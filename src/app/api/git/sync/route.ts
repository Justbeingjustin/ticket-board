import { NextResponse } from 'next/server';
import { sync, isGitRepo } from '@/lib/server/git';

export async function POST() {
  try {
    const isRepo = await isGitRepo();
    if (!isRepo) {
      return NextResponse.json(
        { success: false, message: 'Not a git repository' },
        { status: 400 }
      );
    }

    const result = await sync();
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sync', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

