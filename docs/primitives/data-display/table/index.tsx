import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column A</TableHead>
          <TableHead>Column B</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Cell A1</TableCell>
          <TableCell>Cell B1</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell>Selected A2</TableCell>
          <TableCell>Selected B2</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
