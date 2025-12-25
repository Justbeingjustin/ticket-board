import { NextResponse } from 'next/server';
import { getGitStatus, isGitRepo } from '@/lib/server/git';

export async function GET() {
  try {
    const isRepo = await isGitRepo();
    if (!isRepo) {
      return NextResponse.json(
        { error: 'Not a git repository' },
        { status: 400 }
      );
    }

    const status = await getGitStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting git status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get git status' },
      { status: 500 }
    );
  }
}

