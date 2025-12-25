---
id: T-MJM21VQSOVK
board: main
title: 'On columns, I can''t scroll'
status: done
createdAt: '2025-12-25T23:09:37.395Z'
updatedAt: '2025-12-25T23:15:27.938Z'
owner: bot
priority: high
order: -13
comments:
  - id: c_1735169760
    author: bot
    text: >-
      <p>Fixed column scrolling by adding max-height constraint and
      overflow-y-auto to columns. Changes made in
      <code>src/components/kanban-board.tsx</code>:</p><ul><li>Added
      <code>max-h-[calc(100vh-180px)]</code> to SortableColumn to constrain
      column height</li><li>Added <code>overflow-y-auto</code> to
      DroppableColumn to enable vertical scrolling</li></ul><p>Columns now
      scroll vertically when there are many tickets.</p><img
      src="/column-scroll-fix.png" alt="Done column with scrollbar showing 14
      tickets" />
    createdAt: '2025-12-25T23:16:00.000Z'
---
<p>On columns, I can't scroll. Once there are so many tickets, I can scroll to the bottom to get to all of them.</p>
