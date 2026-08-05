---
title: Overview
---

The admin list primitive — sticky header, sorting, bulk selection, density toggle, cursor
pagination, and a built-in empty/loading state. Never wrap it in a `data.length === 0`
guard; the empty state renders itself. See Examples for a full list-page screen.

For a dense approval / action queue that must stay readable at 390px, set
`preset="action-collection"` and give each column a `priority` on its `ColumnDef` — the same
contract and the same `--table-action-collection-*` tokens the `Table` primitive owns (gh#253).
Never reach for a consumer width, a hidden column or a page-local breakpoint to make a table fit.
See the "Approval queue" example.
