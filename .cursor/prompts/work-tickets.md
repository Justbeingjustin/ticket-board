# Work Tickets Prompt

Use this prompt to have the AI complete tickets from the board.

---

## Basic Usage

```
Complete all backlog tickets in the main board. You are bot. 
Do the work, add a comment with screenshot if applicable, 
then move to review when done.

tickets/main/
```

## Specific Ticket

```
Work on ticket T-XXXXXXXXXX in tickets/main/
Move to in-progress, implement the fix, test it, 
add a comment with screenshot, then move to review.
```

## Multiple Tickets

```
Complete all tasks in tickets/main/ board.
For each backlog ticket:
1. Move to in-progress
2. Implement the fix  
3. Test with browser
4. Screenshot if visual
5. Add comment documenting the change
6. Move to review
```

---

## Key Reminders for AI

- Status values use **hyphens**: `in-progress` not `in_progress`
- Screenshots go in `public/` folder
- Comments are YAML arrays in frontmatter
- Test changes in browser at `http://localhost:3000`
- Take screenshots with browser tools and copy to public folder

