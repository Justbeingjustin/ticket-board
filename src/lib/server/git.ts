import { exec } from 'child_process';
import { promisify } from 'util';
import { REPO_ROOT, GIT_TRACKED_PATHS } from '../constants';
import type { GitStatus, GitFileStatus, SyncResult } from '../types';

const execAsync = promisify(exec);

/**
 * Execute a git command
 */
async function git(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`git ${command}`, {
      cwd: REPO_ROOT,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return stdout.trim();
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string };
    throw new Error(err.stderr || err.message || 'Git command failed');
  }
}

/**
 * Check if we're in a git repository
 */
export async function isGitRepo(): Promise<boolean> {
  try {
    await git('rev-parse --git-dir');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current branch name
 */
export async function getCurrentBranch(): Promise<string> {
  try {
    return await git('rev-parse --abbrev-ref HEAD');
  } catch {
    return 'unknown';
  }
}

/**
 * Get ahead/behind counts relative to upstream
 */
export async function getAheadBehind(): Promise<{ ahead: number; behind: number }> {
  try {
    const result = await git('rev-list --left-right --count @{upstream}...HEAD');
    const [behind, ahead] = result.split('\t').map(Number);
    return { ahead: ahead || 0, behind: behind || 0 };
  } catch {
    // No upstream configured or other error
    return { ahead: 0, behind: 0 };
  }
}

/**
 * Get list of changed files (only for our tracked paths)
 */
export async function getChangedFiles(): Promise<GitFileStatus[]> {
  const files: GitFileStatus[] = [];
  
  try {
    // Get staged files
    const staged = await git('diff --cached --name-status');
    for (const line of staged.split('\n').filter(Boolean)) {
      const [status, filepath] = line.split('\t');
      if (isTrackedPath(filepath)) {
        files.push({
          path: filepath,
          status: 'staged',
        });
      }
    }
    
    // Get modified files (not staged)
    const modified = await git('diff --name-status');
    for (const line of modified.split('\n').filter(Boolean)) {
      const [status, filepath] = line.split('\t');
      if (isTrackedPath(filepath)) {
        files.push({
          path: filepath,
          status: status === 'D' ? 'deleted' : 'modified',
        });
      }
    }
    
    // Get untracked files
    const untracked = await git('ls-files --others --exclude-standard');
    for (const filepath of untracked.split('\n').filter(Boolean)) {
      if (isTrackedPath(filepath)) {
        files.push({
          path: filepath,
          status: 'untracked',
        });
      }
    }
  } catch (error) {
    console.error('Error getting changed files:', error);
  }
  
  return files;
}

/**
 * Check if a path is one we track
 */
function isTrackedPath(filepath: string): boolean {
  return GIT_TRACKED_PATHS.some(p => filepath.startsWith(p));
}

/**
 * Get full git status
 */
export async function getGitStatus(): Promise<GitStatus> {
  const branch = await getCurrentBranch();
  const { ahead, behind } = await getAheadBehind();
  const files = await getChangedFiles();
  
  const modified = files.filter(f => f.status === 'modified').length;
  const untracked = files.filter(f => f.status === 'untracked').length;
  const staged = files.filter(f => f.status === 'staged').length;
  
  return {
    branch,
    ahead,
    behind,
    modified,
    untracked,
    staged,
    hasChanges: files.length > 0,
    files,
  };
}

/**
 * Check if working directory is clean
 */
export async function isClean(): Promise<boolean> {
  const status = await getGitStatus();
  return !status.hasChanges;
}

/**
 * Sync: fetch, pull (if clean), commit local changes, push
 * This is a smart sync that handles common scenarios
 */
export async function sync(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    message: '',
    pulled: false,
    committed: false,
    pushed: false,
  };

  try {
    // First, fetch to get latest refs
    await git('fetch');
    
    const status = await getGitStatus();
    
    // If we have local changes, commit them first
    if (status.hasChanges) {
      try {
        // Stage our tracked paths
        for (const p of GIT_TRACKED_PATHS) {
          try {
            await git(`add ${p}`);
          } catch {
            // Path might not exist yet
          }
        }
        
        // Commit
        const timestamp = new Date().toISOString().split('T')[0];
        await git(`commit -m "Sync tickets ${timestamp}"`);
        result.committed = true;
      } catch (error) {
        // Might fail if nothing to commit
      }
    }
    
    // Get fresh status after potential commit
    const { behind } = await getAheadBehind();
    
    // If behind, try to pull
    if (behind > 0) {
      try {
        await git('pull --rebase');
        result.pulled = true;
      } catch (error: unknown) {
        const err = error as Error;
        // Rebase conflict
        if (err.message.includes('conflict') || err.message.includes('CONFLICT')) {
          await git('rebase --abort');
          result.message = 'Sync conflict detected. Please resolve manually.';
          result.error = err.message;
          return result;
        }
        throw error;
      }
    }
    
    // Get fresh status after potential pull
    const { ahead } = await getAheadBehind();
    
    // If ahead, push
    if (ahead > 0 || result.committed) {
      try {
        await git('push');
        result.pushed = true;
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message.includes('rejected')) {
          result.message = 'Push rejected. Someone else pushed changes.';
          result.error = err.message;
          return result;
        }
        throw error;
      }
    }
    
    // Build success message
    const actions = [];
    if (result.pulled) actions.push('pulled');
    if (result.committed) actions.push('committed');
    if (result.pushed) actions.push('pushed');
    
    result.success = true;
    result.message = actions.length > 0 
      ? `Synced: ${actions.join(', ')}`
      : 'Already up to date';
    
    return result;
  } catch (error: unknown) {
    const err = error as Error;
    result.message = 'Sync failed';
    result.error = err.message;
    return result;
  }
}
