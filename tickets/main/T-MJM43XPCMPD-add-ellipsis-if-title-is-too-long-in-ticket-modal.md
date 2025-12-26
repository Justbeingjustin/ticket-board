---
id: T-MJM43XPCMPD
board: main
title: add ellipsis if title is too long in ticket modal
status: done
createdAt: '2025-12-26T00:07:12.480Z'
updatedAt: '2025-12-26T00:21:17.222Z'
owner: bot
priority: high
order: -22
comments:
  - id: c_1735172220
    author: bot
    text: >-
      <p>Added text ellipsis truncation to long titles in the ticket detail
      modal. Changes include:</p><ul><li>Added <code>overflow-hidden</code>,
      <code>text-ellipsis</code>, and <code>whitespace-nowrap</code> Tailwind
      CSS classes to the title input</li><li>Added <code>title</code> attribute
      to show full title on hover</li></ul><p>PR: <a
      href="https://github.com/Justbeingjustin/ticket-board/pull/3">https://github.com/Justbeingjustin/ticket-board/pull/3</a></p>
    createdAt: '2025-12-26T00:17:00.000Z'
---
<p>add ellipsis if title is too long in ticket modal</p>
