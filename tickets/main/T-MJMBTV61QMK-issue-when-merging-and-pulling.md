---
id: T-MJMBTV61QMK
board: main
title: issue when merging and pulling
status: review
createdAt: '2025-12-26T03:43:19.561Z'
updatedAt: '2025-12-26T04:15:00.000Z'
owner: bot
priority: critical
comments:
  - id: c_1735187700
    author: bot
    text: '<p>Fixed the merge conflict workflow issue by separating ticket updates from code changes.</p><p><strong>Root Cause:</strong> Ticket files were being updated in the worktree and committed to the feature branch, causing conflicts when the PR was merged to main.</p><p><strong>Solution:</strong> Ticket status/comments now update in the main repo (main branch) immediately, while code changes happen in the worktree (feature branch). This prevents divergence and eliminates merge conflicts.</p><p>See documentation: <code>/public/merge-conflict-fix-summary.md</code> and <code>/public/workflow-fix-diagram.txt</code></p><p>PR: https://github.com/Justbeingjustin/ticket-board/pull/10</p>'
    createdAt: '2025-12-26T04:15:00.000Z'
---
<p>sometimes after running /work-ticket T-etc<br><br>it creates PR. I merge it main. and then the ticket has new status with image. but after merge on github desktop it just takes files to be discarded then I can pull it in. Come up with a better way  so that it's smoother. Also, feel free to modify cursor command work-ticket if that helps any.</p>
