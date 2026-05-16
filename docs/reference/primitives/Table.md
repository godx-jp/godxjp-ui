---
diataxis: reference
library: "@godxjp/ui"
library_version: 3.0.0
component: Table
status: stable
audience: [developer, agent]
---

# Table

> Semantic table with horizontal scroll wrapper — styled by the `.table` token class.

## Usage

```tsx
import {
  Table, TableHeader, TableBody, TableFooter,
  TableRow, TableHead, TableCell, TableCaption,
} from "@godxjp/ui"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="num">Issues</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {projects.map((p) => (
      <TableRow key={p.id}>
        <TableCell>{p.name}</TableCell>
        <TableCell><Badge variant="success">Active</Badge></TableCell>
        <TableCell className="num">{p.openIssues}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableCaption>Project list as of today</TableCaption>
</Table>
```

## Exports

| Export | Element | Description |
|---|---|---|
| `Table` | `<div>` wrapper + `<table>` | Scroll container + table root |
| `TableHeader` | `<thead>` | Header section |
| `TableBody` | `<tbody>` | Body section |
| `TableFooter` | `<tfoot>` | Footer section |
| `TableRow` | `<tr>` | Table row |
| `TableHead` | `<th>` | Header cell |
| `TableCell` | `<td>` | Data cell |
| `TableCaption` | `<caption>` | Table caption |

## Props — Table

| Prop | Type | Default | Description |
|---|---|---|---|
| `containerClassName` | `string` | — | CSS class for the outer scroll container |
| `...rest` | `HTMLAttributes<HTMLTableElement>` | — | Standard `<table>` props |

## Accessibility

- Uses native semantic HTML (`<table>`, `<thead>`, `<th>`, `<td>`) — screen readers announce table structure automatically.
- `<th>` elements in `TableHeader` have implicit `scope="col"` — add `scope="row"` to row headers.
- `TableCaption` renders a `<caption>` element — announced by screen readers as the table label.
- Horizontal scroll container (`table-scroll`) allows keyboard scrolling via native browser behavior.
- WCAG 2.1 SC 1.3.1 (Info and Relationships): table headers convey structure.

## CSS utility classes

The `.num` class (from tokens.css) right-aligns numeric cells with monospace tabular figures:

```tsx
<TableHead className="num">Count</TableHead>
<TableCell className="num">{count}</TableCell>
```

The `.mono` class applies monospace font for code or hash values.

## Composition

```tsx
// Table inside a Card
<Card>
  <CardHeader>
    <CardTitle>Recent deployments</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Version</TableHead>
          <TableHead>Deployed by</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deployments.map((d) => (
          <TableRow key={d.id}>
            <TableCell className="mono">{d.version}</TableCell>
            <TableCell>{d.deployer}</TableCell>
            <TableCell><Badge variant={d.ok ? "success" : "error"}>{d.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

## See also

- [Card](./Card.md) — common wrapping context.
- [Badge](./Badge.md) — status indicators in table cells.
