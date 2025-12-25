# Git Kanban

A local Kanban board that stores tickets as markdown files in your git repository. No database required - all data lives in your repo.

## Features

- 🎨 **Dark/Light Mode** - Toggle between themes
- 📋 **Multiple Boards** - Create and manage different Kanban boards
- 🏷️ **Configurable Columns** - Add, rename, or delete columns per board
- 🎯 **Priority Levels** - Color-coded priorities (Critical, High, Medium, Low)
- 👥 **User Assignment** - Assign tickets to team members
- 🔄 **Drag & Drop** - Move tickets between columns with ease
- ☁️ **One-Click Sync** - Commit and push changes with a single button
- 📝 **Markdown Support** - Full markdown descriptions for tickets

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## File Layout

```
your-repo/
├── .kanban/
│   └── config.json        # Board config, priorities, users
├── tickets/
│   └── <board-slug>/      # One folder per board
│       └── <ticket-id>-<slug>.md  # Ticket files
└── ...
```

### Config File (`.kanban/config.json`)

```json
{
  "boards": [
    {
      "id": "board_1",
      "name": "Main",
      "slug": "main",
      "columns": [
        { "id": "backlog", "name": "Backlog" },
        { "id": "in-progress", "name": "In Progress" },
        { "id": "review", "name": "Review" },
        { "id": "done", "name": "Done" }
      ]
    }
  ],
  "priorities": [
    { "id": "critical", "name": "Critical", "color": "#ef4444" },
    { "id": "high", "name": "High", "color": "#f97316" },
    { "id": "medium", "name": "Medium", "color": "#eab308" },
    { "id": "low", "name": "Low", "color": "#3b82f6" }
  ],
  "users": [
    { "id": "user_1", "name": "Justin" }
  ]
}
```

### Ticket File Format

Tickets are stored as markdown files with YAML frontmatter:

```markdown
---
id: T-ABC123XYZ
board: main
title: "Implement feature X"
status: in-progress
priority: high
owner: user_1
createdAt: "2025-12-25T00:00:00.000Z"
updatedAt: "2025-12-25T12:00:00.000Z"
---

Description goes here. Supports **markdown** formatting.

- [ ] Subtask 1
- [ ] Subtask 2
```

## Git Integration

The app includes built-in Git controls:

- **Branch Display** - Shows current branch name
- **Change Indicator** - Shows count of unsaved changes
- **Sync Button** - One-click to commit and push changes

The Sync operation:
1. Stages all changes in `.kanban/` and `tickets/`
2. Creates a commit with timestamp
3. Pulls remote changes (with rebase)
4. Pushes to remote

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **dnd-kit** for drag and drop
- **gray-matter** for frontmatter parsing
- **next-themes** for dark/light mode

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | Get config (boards, priorities, users) |
| POST | `/api/boards` | Create/update boards, priorities, users |
| GET | `/api/tickets?board=<slug>` | List tickets for a board |
| POST | `/api/tickets` | Create a new ticket |
| PUT | `/api/tickets/<id>?board=<slug>` | Update a ticket |
| GET | `/api/git/status` | Get git status |
| POST | `/api/git/sync` | Sync (commit + pull + push) |

## Limitations

- Single-user local tool (no authentication)
- Requires git to be installed and configured
- Conflicts during sync require manual resolution
- File renames when ticket titles change

## License

MIT
