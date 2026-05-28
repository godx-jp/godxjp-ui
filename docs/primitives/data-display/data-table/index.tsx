import { DataTable } from "@godxjp/ui/data-display";

import { columns, rows } from "./_data";

export default function Demo() {
  return (
    <DataTable data={rows} columns={columns} getRowId={(row) => row.id}>
      <DataTable.Content />
    </DataTable>
  );
}
