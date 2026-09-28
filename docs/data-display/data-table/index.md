--- title: Overview ---

The admin list primitive — sticky header, sorting, bulk selection, density toggle, cursor pagination, and a built-in empty/loading state. Never wrap it in a `data.length === 0` guard; the empty state renders itself. See Examples for a full list-page screen.

See the "Approval queue" example.

See the "Selectable inbox" example for a `ListRow` hosted in a selectable DataTable: mark that column `flush: true` so the cell drops its own padding and the ListRow owns the inset (gh#1016).
