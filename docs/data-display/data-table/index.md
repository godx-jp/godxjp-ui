--- title: Overview ---

The admin list primitive — sticky header, sorting, bulk selection, density toggle, cursor pagination, and a built-in empty/loading state. Never wrap it in a `data.length === 0` guard; the empty state renders itself. See Examples for a full list-page screen.

See the "Approval queue" example.

See the "Selectable inbox" example for a `ListRow` hosted in a selectable DataTable: mark that column `flush: true` so the cell drops its own padding and the ListRow owns the inset (gh#1016).

See the "Server paged" example for selection on a server-paged list (gh#1036). `rowSelection.selectAllLabel` names the header checkbox; `rowSelection.matching={{ total, selected, onSelectedChange }}` adds the "Select all N matching rows" banner once the page is fully ticked. antd has no equivalent of `matching` — it is the Gmail / Jira / GitHub pattern, and the one deliberate deviation from antd's `rowSelection` here. While `selected` is true every row of any page shows ticked; send the query's filter to the server instead of the ids. Unticking a row or "Clear selection" reports `false`. `selections` also takes antd's `DataTable.SELECTION_ALL` / `SELECTION_INVERT` / `SELECTION_NONE` mixed with custom entries.
