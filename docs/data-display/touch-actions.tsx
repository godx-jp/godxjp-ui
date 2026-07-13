import { useState } from "react";
import { DataTable, ListRow, type ColumnDef } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

type Row = { id: string; name: string };
const rows: Row[] = [{ id: "1", name: "請求書 INV-1" }];
const columns: ColumnDef<Row>[] = [{ key: "name", header: "名前" }];

export default function Demo() {
  const [buttonCount, setButtonCount] = useState(0);
  const [rowActions, setRowActions] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  return (
    <PageContainer title="Touch action journeys">
      <Flex direction="col" gap="lg">
        <Button onClick={() => setButtonCount((n) => n + 1)}>Button action</Button>
        <output aria-label="Button result">{buttonCount}</output>
        <ListRow
          title="Session"
          trailing={<Button onClick={() => setRowActions((n) => n + 1)}>Sign out</Button>}
        />
        <output aria-label="ListRow result">{rowActions}</output>
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          selectable
          selected={selected}
          onSelectChange={setSelected}
        />
        <output aria-label="Selection result">{selected.size}</output>
      </Flex>
    </PageContainer>
  );
}
