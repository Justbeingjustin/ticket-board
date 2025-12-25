---
id: T-MJM20OOTCJF
board: main
title: Make ticket modal scrollable
status: done
createdAt: '2025-12-25T23:08:41.597Z'
updatedAt: '2025-12-25T23:15:24.175Z'
owner: bot
priority: high
order: -12
comments:
  - id: c_1735169400
    author: bot
    text: >-
      <p>Fixed the modal scrollability by making two key changes to
      <code>src/components/ticket-detail.tsx</code>:</p><ol><li>Changed
      <code>max-h-[90vh] overflow-hidden</code> to <code>h-[90vh]</code> on the
      DialogContent to give it a fixed viewport height</li><li>Added
      <code>min-h-0</code> to the ScrollArea component to allow it to shrink
      properly within the flex container</li></ol><p>The modal now properly
      constrains its height and the footer (Delete, Cancel, Save Changes
      buttons) is always accessible at the bottom.</p><img
      src="/modal-scrollable-fix.png" alt="Modal with footer visible" />
    createdAt: '2025-12-25T23:30:00.000Z'
---
<p>make the ticket modal scrollable. I currently can't get to the bottom.</p>
