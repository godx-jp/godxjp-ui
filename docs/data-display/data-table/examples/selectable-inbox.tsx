import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  ListRow,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { PageContainer } from "@godxjp/ui/layout";

/**
 * A selectable inbox — `ListRow` hosted in a DataTable column (gh#1016).
 *
 * DataTable is the only primitive that selects rows; ListRow is the canonical entity row. The
 * column is marked `flush: true`, so its body cells drop their own padding and the ListRow owns
 * the inset: the avatar sits 16px from the checkbox (the same step as any other column, not 32px),
 * the row is ListRow's own height, and an unread row's band spans the whole table row — the
 * checkbox cell included. The header cell keeps its padding, so its label sits on the row's inset.
 */
type Message = {
  id: string;
  from: string;
  initials: string;
  subject: string;
  read: boolean;
};

const MESSAGES: Message[] = [
  {
    id: "m1",
    from: "Aiko Tanaka",
    initials: "AT",
    subject: "April invoice is ready",
    read: false,
  },
  {
    id: "m2",
    from: "Minh Nguyen",
    initials: "MN",
    subject: "Release notes for 4.2",
    read: false,
  },
  {
    id: "m3",
    from: "Kenji Sato",
    initials: "KS",
    subject: "Meeting minutes",
    read: true,
  },
  {
    id: "m4",
    from: "Lan Pham",
    initials: "LP",
    subject: "Access request approved",
    read: true,
  },
];

const columns: ColumnDef<Message>[] = [
  {
    key: "message",
    header: "Message",
    // The cell's CONTENT owns the inset — without it the cell padding stacks on the row's.
    flush: true,
    render: (m) => (
      <ListRow
        asChild
        density="compact"
        unread={!m.read}
        leading={
          <Avatar size="sm">
            <AvatarFallback>{m.initials}</AvatarFallback>
          </Avatar>
        }
        title={m.from}
        description={m.subject}
      >
        <a href={`#${m.id}`} />
      </ListRow>
    ),
  },
];

export default function SelectableInboxDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["m2"]));

  return (
    <PageContainer title="Inbox" subtitle="DataTable selectable · ListRow in a flush column">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent flush>
          <DataTable
            data={MESSAGES}
            columns={columns}
            getRowId={(m) => m.id}
            getRowLabel={(m) => m.subject}
            selectable
            selected={selected}
            onSelectChange={setSelected}
            density="compact"
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
