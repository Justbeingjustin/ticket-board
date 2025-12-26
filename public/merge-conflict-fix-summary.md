# Fix for Merge Conflict Issue (T-MJMBTV61QMK)

## Problem
When completing tickets using `/work-ticket`, the bot would:
1. Update ticket files (status, comments, screenshots) in the worktree
2. Commit these changes to the feature branch
3. Create a PR
4. When PR was merged, user would have conflicts when pulling

The conflict occurred because:
- Local main branch had old ticket state
- Remote main branch (after PR merge) had new ticket state
- Git required discarding local changes before pulling

## Root Cause
Ticket metadata (status, comments) was being committed to the feature branch along with code changes, creating a divergence in the ticket files between local and remote main branches.

## Solution
Separate ticket updates from code changes:

### Ticket Updates (Main Repo → Main Branch)
- Status changes (backlog → in-progress → review → done)
- Comments with screenshots
- All committed directly to main branch and pushed immediately

### Code Changes (Worktree → Feature Branch)
- Source code modifications
- Screenshots copied to worktree for PR visibility
- Committed to feature branch only

### Benefits
1. **No merge conflicts**: Ticket updates happen on main before PR merge
2. **Clean PRs**: Only code changes in pull requests
3. **Real-time status**: Kanban board updates immediately when work starts
4. **Smooth workflow**: No need to discard changes after merging

## Updated Workflow

```bash
# 1. Update ticket status in MAIN repo
cd ticket-board2
git add tickets/main/T-XXXXX.md
git commit -m "chore: move T-XXXXX to in-progress"
git push origin main

# 2. Work on code in worktree
cd ../worktrees/T-XXXXX
# make changes...
git add -A
git commit -m "feat(T-XXXXX): implemented feature"
git push -u origin feature/T-XXXXX

# 3. Create PR (code only)
gh pr create --title "Feature Title"

# 4. Update ticket status in MAIN repo (again)
cd ../../ticket-board2
git add tickets/main/T-XXXXX.md
git commit -m "chore: update T-XXXXX to review with screenshot"
git push origin main

# 5. After PR merge - smooth pull
git pull origin main  # No conflicts!
```

## Files Modified
- `.cursor/commands/work-ticket.md` - Updated instructions to emphasize MAIN repo for ticket updates
- Added clear separation between ticket management and code changes
- Added notes section highlighting the key principle

## Command Changes
### Step 4: Move Ticket to In Progress (in MAIN repo)
- Now explicitly states to update in MAIN repo
- Includes git commit and push commands

### Step 8: Save Screenshot & Commit Code Changes  
- Screenshot saved to MAIN repo public/ folder first
- Then copied to worktree for PR visibility
- Code committed in worktree only

### Step 10: Update Ticket Status & Add Comment (in MAIN repo)
- Ticket update happens in MAIN repo
- Explicit commit and push to main branch
- PR link added to ticket comment

## Testing
This fix has been tested and is now the standard workflow. The work-ticket command has been updated to reflect these changes.

