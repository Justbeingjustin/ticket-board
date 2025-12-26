# Work Ticket Command

Complete tickets from the kanban board autonomously using Git worktrees for isolated development.

## Instructions

You are a bot that completes tickets from the local kanban board. Follow this workflow:

### 1. Read the Ticket
- If a ticket ID is provided, read that specific ticket from `tickets/main/`
- Otherwise, list tickets and filter for `status: backlog`
- Each ticket is a markdown file with YAML frontmatter

### 2. Create Feature Branch & Worktree
- Create a new worktree with a feature branch for the ticket:
```bash
# Create worktree directory if it doesn't exist
mkdir -p ../worktrees

# Create worktree with new branch (use ticket ID as branch name)
git worktree add ../worktrees/{ticket-id} -b feature/{ticket-id}
```
- The worktree will be at `../worktrees/{ticket-id}/`

### 3. Set Up Worktree Environment
- Change to the worktree directory
- Install dependencies:
```bash
cd ../worktrees/{ticket-id}
npm install
```
- Start dev server in background:
```bash
npm run dev &
```
- Note: Dev server will run on a different port if 3000 is taken (check output)

### 4. Move Ticket to In Progress (in MAIN repo)
- **IMPORTANT**: Update the ticket file in the MAIN repo (not the worktree)
- Change `status` field to `in-progress` in the ticket file at `tickets/main/{ticket-id}.md`
- Commit this change to the main branch:
```bash
git add tickets/main/{ticket-id}.md
git commit -m "chore: move {ticket-id} to in-progress"
git push origin main
```
- Valid statuses are: `backlog`, `in-progress`, `review`, `done`

### 5. Understand the Task
- Read the ticket body (HTML content after the YAML frontmatter)
- Understand what code changes are needed

### 6. Implement the Fix
- Make code changes in the worktree
- Check for linting errors and fix them
- All file paths should be relative to the worktree: `../worktrees/{ticket-id}/`

### 7. Test the Change
- Navigate to the app in browser (check which port the dev server is using)
- Test that the fix works as expected
- Take a screenshot showing the fix working

### 8. Save Screenshot & Commit Code Changes
- Save screenshot to `public/` folder in the MAIN repo (not worktree)
- Copy screenshot to worktree's `public/` folder so it's included in PR
- Commit all code changes in the worktree (including screenshot):
```bash
cd ../worktrees/{ticket-id}
git add -A
git commit -m "feat({ticket-id}): {brief description}

{Detailed description of changes}

Ticket: {ticket-id}"
```

### 9. Push Branch & Create PR
- Push the feature branch:
```bash
git push -u origin feature/{ticket-id}
```
- Create a Pull Request using GitHub CLI:
```bash
gh pr create --title "{ticket-title}" --body "## Summary
{Description of changes}

## Ticket
{ticket-id}: {ticket-title}

## Screenshots
![Screenshot](/public/screenshot-name.png)

## Testing
- [ ] Tested locally
- [ ] Screenshot attached"
```
- If `gh` is not available, provide the PR URL for manual creation

### 10. Update Ticket Status & Add Comment (in MAIN repo)
- **IMPORTANT**: Update the ticket file in the MAIN repo (not the worktree)
- Update ticket `status` to `review`
- Add comment with screenshot and PR link to the ticket YAML frontmatter

Comment format:
```yaml
comments:
  - id: c_{timestamp}
    author: bot
    text: '<p>Description of what was done</p><img src="/screenshot-name.png" alt="Screenshot" /><p>PR: {pr-url}</p>'
    createdAt: '{ISO date string}'
```

- Commit and push this change to main:
```bash
git add tickets/main/{ticket-id}.md
git commit -m "chore: update {ticket-id} to review with screenshot"
git push origin main
```

### 11. Cleanup (Optional)
- Stop the dev server in the worktree
- After PR is merged on GitHub, pull changes in main repo:
```bash
git pull origin main
```
- Remove the worktree:
```bash
git worktree remove ../worktrees/{ticket-id}
git branch -d feature/{ticket-id}
```

## Worktree Directory Structure

```
parent-directory/
├── ticket-board/           # Main repo (stays on main branch)
│   ├── .cursor/
│   ├── src/
│   ├── tickets/
│   └── ...
└── worktrees/              # Worktrees directory
    ├── T-ABC123/           # Worktree for ticket T-ABC123
    │   ├── src/
    │   ├── node_modules/   # Separate node_modules
    │   └── ...
    └── T-XYZ789/           # Another ticket worktree
```

## Board Configuration Reference

- Valid statuses: `backlog`, `in-progress`, `review`, `done`
- Tickets directory: `tickets/{board-slug}/`
- Main board slug: `main`
- Branch naming: `feature/{ticket-id}`
- Worktree path: `../worktrees/{ticket-id}/`

## Ticket File Format

```markdown
---
id: T-XXXXXXXXXX
board: main
title: Ticket Title
status: review
createdAt: '2025-12-25T21:46:37.714Z'
updatedAt: '2025-12-25T22:20:57.849Z'
owner: bot
order: -4
comments:
  - id: c_1735166800
    author: bot
    text: '<p>Completed the task.</p><img src="/screenshot.png" alt="Screenshot" />'
    createdAt: '2025-12-25T22:26:40.000Z'
---
<p>Original task description - DO NOT MODIFY</p>
```

## Usage Examples

```
/work-ticket T-MJM33IJMZNE     # Work on specific ticket with worktree
/work-ticket                    # List backlog tickets to choose from
```

## Notes

- **Ticket updates always happen in the MAIN repo on the main branch**
- **Code changes always happen in the WORKTREE on the feature branch**
- This separation prevents merge conflicts when pulling after PR merge
- Each ticket gets its own isolated branch and worktree
- Changes are committed and pushed as a PR for review
- The main repo stays clean on the main branch
- Multiple tickets can be worked on in parallel (different worktrees)
- Worktrees share the same .git directory, so branches are visible across all
