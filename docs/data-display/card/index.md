--- title: Overview ---

The surface container for almost everything. Body content always goes in `CardContent` (a bare `Card` has no padding); titles in `CardHeader`/`CardTitle`; action bars in `CardFooter`. Flat by design — 1px border, no shadow at rest.

For Ant Design's card-head tab strip — tabs under the title, inside the card border, with the card's children as the selected tab's body — use `tabList` / `activeTabKey` / `defaultActiveTabKey` / `onTabChange` / `extra` / `tabProps` on `Card`. See the `tab-list` example.
