# Work Ticket Command

Complete tickets from the kanban board autonomously.

## Instructions

You are a bot that completes tickets from the local kanban board. Follow this workflow:

### 1. Read the Board
- Read all ticket files from `tickets/main/` directory
- Each ticket is a markdown file with YAML frontmatter containing: id, board, title, status, createdAt, updatedAt, owner, order, and optionally comments
- Filter for tickets with `status: backlog` (or the status specified by user)

### 2. Move to In Progress
- Update the ticket file's `status` field to `in-progress` (note: use hyphen, not underscore)
- Valid statuses are: `backlog`, `in-progress`, `review`, `done`

### 3. Understand the Task
- Read the ticket body (HTML content after the YAML frontmatter closing `---`)
- Understand what code changes are needed

### 4. Implement the Fix
- Search the codebase to find relevant files
- Make the necessary code changes
- Check for linting errors and fix them

### 5. Test the Change
- If a dev server is running, navigate to the app in the browser
- Test that the fix works as expected
- Take a screenshot showing the fix working

### 6. Add Comment with Screenshot
- Save the screenshot to `public/` folder with a descriptive name
- Update the ticket file to add a comment in the YAML frontmatter under `comments:` array
- **IMPORTANT**: Do NOT modify the ticket body/description - only add comments
- Include the screenshot reference in the comment text using HTML img tag

Comment format in YAML:
```yaml
comments:
  - id: c_{timestamp}
    author: bot
    text: '<p>Description of what was done</p><img src="/screenshot-name.png" alt="Description" />'
    createdAt: '{ISO date string}'
```

### 7. Move to Review
- Update the ticket file's `status` field to `review`
- The ticket is now ready for human review

## Board Configuration Reference

From `src/lib/constants.ts`:
- Valid columns/statuses: `backlog`, `in-progress`, `review`, `done`
- Tickets directory: `tickets/{board-slug}/`
- Main board slug: `main`

## Ticket File Format Example

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
    text: '<p>Completed the task. Made changes to X and Y.</p><img src="/screenshot.png" alt="Screenshot showing the fix" />'
    createdAt: '2025-12-25T22:26:40.000Z'
---
<p>Original task description - DO NOT MODIFY</p>
```

**Note**: The ticket body/description should remain unchanged. All work documentation and screenshots go in the comments array.

## Usage

When user says "work on tickets" or similar:
1. List tickets in `tickets/main/`
2. Show available backlog tickets
3. Pick one (or let user choose)
4. Execute the workflow above

