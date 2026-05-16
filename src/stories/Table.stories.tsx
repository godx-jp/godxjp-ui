import type { Meta, StoryObj } from "@storybook/react";
import {
  Archive,
  ChevronDown,
  Clock,
  ExternalLink,
  FolderGit2,
  MoreHorizontal,
  Pencil,
  Play,
  Square,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/primitives/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/primitives/DropdownMenu";
import { Tag } from "../components/primitives/Tag";
import { Avatar } from "../components/primitives/Avatar";
import { Button } from "../components/primitives/Button";
import { Skeleton } from "../components/primitives/Skeleton";
import { Empty } from "../components/primitives/Empty";
import { Flex, Space, Row, Col } from "../components/primitives/layout";
import { Card } from "../components/primitives/Card";

const meta: Meta<typeof Table> = {
  title: "Primitives/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Table** — semantic data table.

The primitive is a thin shadcn-style wrapper over the native HTML
table elements; the visual contract lives in the \`.table\` class
from \`tokens.css\` and a \`.table-scroll\` outer div that handles
horizontal overflow gracefully.

| Export | Renders |
|---|---|
| \`Table\` | \`<div.table-scroll><table.table /></div>\` — accepts a \`containerClassName\` prop for the scroll wrapper. |
| \`TableHeader\` | \`<thead>\` |
| \`TableBody\` | \`<tbody>\` |
| \`TableFooter\` | \`<tfoot>\` — typical use is a summary / totals row. |
| \`TableRow\` | \`<tr>\` |
| \`TableHead\` | \`<th>\` — header cell. |
| \`TableCell\` | \`<td>\` — body cell. |
| \`TableCaption\` | \`<caption>\` — muted-foreground, small. |

**Accessibility (WCAG 2.1 AA).** Because the primitives render native
HTML table elements, assistive tech treats the result as a real
\`role="table"\` with native row / column semantics. Add a
\`<TableCaption>\` for screen-reader-friendly titles. For checkbox
selection columns add an \`aria-label\` to each cell's checkbox.

**Density.** The \`.table\` class is tuned to the brand bible's 4-px
grid — header row 36 px, body rows 40 px. Compose with smaller
content (icons sized 14, tags borderless, avatars size="sm") to keep
the rhythm.

**Horizontal scroll.** Wide tables overflow horizontally inside the
\`.table-scroll\` container instead of breaking page layout. No extra
config required.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Table>;

// ─────────────────────────────────────────────────────────────────────────
// Data fixtures (realistic — godx-admin sandbox-ish content)
// ─────────────────────────────────────────────────────────────────────────

type Status = "active" | "idle" | "starting" | "failed";

const USERS = [
  { id: "u1", name: "Yuki Tanaka",  email: "yuki@famgia.com",  role: "Owner",  status: "active"  as const, color: "oklch(56% 0.15 240)" },
  { id: "u2", name: "Anh Nguyen",   email: "anh@betoya.com",   role: "Admin",  status: "active"  as const, color: "oklch(58% 0.14 25)"  },
  { id: "u3", name: "Lê Lợi",       email: "le@tempo.local",   role: "Member", status: "idle"    as const, color: "oklch(60% 0.14 145)" },
  { id: "u4", name: "Sato Naoki",   email: "sato@famgia.com",  role: "Member", status: "active"  as const, color: "oklch(62% 0.14 320)" },
  { id: "u5", name: "Maria Cruz",   email: "maria@example.io", role: "Viewer", status: "idle"    as const, color: "oklch(64% 0.12 60)"  },
];

const SANDBOXES = [
  { id: "sb-001", name: "sb-yuki-feat-forge-shell-align", project: "godx-admin",     status: "active"   as Status, last: "2026-05-15 09:12", user: USERS[0] },
  { id: "sb-002", name: "sb-anh-completion-phase-z",     project: "me-service",     status: "active"   as Status, last: "2026-05-15 08:47", user: USERS[1] },
  { id: "sb-003", name: "sb-le-chat-completion-x",       project: "chat-service",   status: "idle"     as Status, last: "2026-05-14 22:09", user: USERS[2] },
  { id: "sb-004", name: "sb-sato-media-presign",         project: "media-service",  status: "starting" as Status, last: "2026-05-15 09:30", user: USERS[3] },
  { id: "sb-005", name: "sb-maria-vault-rotation",       project: "sandbox-service",status: "failed"   as Status, last: "2026-05-15 03:11", user: USERS[4] },
];

const STATUS_TAG: Record<Status, { color: string; label: string }> = {
  active:   { color: "success",   label: "active"   },
  idle:     { color: "default",   label: "idle"     },
  starting: { color: "info",      label: "starting" },
  failed:   { color: "error",     label: "failed"   },
};

// ─────────────────────────────────────────────────────────────────────────
// Basic
// ─────────────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default — 4 cols × 5 rows",
  parameters: { controls: { disable: true } },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {USERS.map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.role}</TableCell>
            <TableCell>
              <Tag color={u.status === "active" ? "success" : "default"}>{u.status}</Tag>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCaption: Story = {
  name: "Default — with caption",
  parameters: { controls: { disable: true } },
  render: () => (
    <Table>
      <TableCaption>Org members — synced from Zitadel 2026-05-15 09:00 JST</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {USERS.slice(0, 3).map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.name}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// With footer total
// ─────────────────────────────────────────────────────────────────────────

export const WithFooter: Story = {
  name: "Variants — with footer total",
  parameters: { controls: { disable: true } },
  render: () => {
    const rows = [
      { item: "Sandbox hours",   qty: 312,  rate: 0.04 },
      { item: "Storage GB · mo", qty: 48,   rate: 0.02 },
      { item: "Egress GB",       qty: 16,   rate: 0.05 },
      { item: "Vault secrets",   qty: 5,    rate: 0.00 },
    ];
    const total = rows.reduce((acc, r) => acc + r.qty * r.rate, 0);
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead style={{ textAlign: "right" }}>Qty</TableHead>
            <TableHead style={{ textAlign: "right" }}>Rate (USD)</TableHead>
            <TableHead style={{ textAlign: "right" }}>Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.item}>
              <TableCell>{r.item}</TableCell>
              <TableCell style={{ textAlign: "right" }}>{r.qty}</TableCell>
              <TableCell style={{ textAlign: "right" }}>${r.rate.toFixed(2)}</TableCell>
              <TableCell style={{ textAlign: "right" }}>${(r.qty * r.rate).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} style={{ textAlign: "right", fontWeight: 600 }}>
              Total
            </TableCell>
            <TableCell style={{ textAlign: "right", fontWeight: 600 }}>
              ${total.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Selected row
// ─────────────────────────────────────────────────────────────────────────

export const SelectedRow: Story = {
  name: "States — selected row",
  parameters: { controls: { disable: true } },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SANDBOXES.slice(0, 4).map((sb, i) => (
          <TableRow
            key={sb.id}
            aria-selected={i === 1 ? "true" : undefined}
            style={
              i === 1
                ? {
                    background: "color-mix(in oklch, var(--primary) 8%, transparent)",
                    outline: "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
                  }
                : undefined
            }
          >
            <TableCell>{sb.name}</TableCell>
            <TableCell>{sb.project}</TableCell>
            <TableCell>
              <Tag color={STATUS_TAG[sb.status].color}>{STATUS_TAG[sb.status].label}</Tag>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Sticky header
// ─────────────────────────────────────────────────────────────────────────

export const StickyHeader: Story = {
  name: "Variants — sticky header (vertical scroll)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
      <Table>
        <TableHeader
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: "var(--surface-2)",
            boxShadow: "inset 0 -1px 0 var(--border)",
          }}
        >
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 20 }).map((_, i) => {
            const sb = SANDBOXES[i % SANDBOXES.length];
            return (
              <TableRow key={`${sb.id}-${i}`}>
                <TableCell>{sb.name}-{i + 1}</TableCell>
                <TableCell>{sb.project}</TableCell>
                <TableCell>
                  <Tag color={STATUS_TAG[sb.status].color}>{STATUS_TAG[sb.status].label}</Tag>
                </TableCell>
                <TableCell>{sb.last}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Rich cells: Avatar + name + status + actions
// ─────────────────────────────────────────────────────────────────────────

export const RichCells: Story = {
  name: "Variants — avatar + tag + action cells",
  parameters: { controls: { disable: true } },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={{ textAlign: "right" }}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {USERS.map((u) => (
          <TableRow key={u.id}>
            <TableCell>
              <Space size="middle" align="center">
                <Avatar size="sm" color={u.color}>{u.name.charAt(0)}</Avatar>
                <Flex vertical gap={2}>
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{u.email}</span>
                </Flex>
              </Space>
            </TableCell>
            <TableCell>{u.role}</TableCell>
            <TableCell>
              <Tag color={u.status === "active" ? "success" : "default"}>{u.status}</Tag>
            </TableCell>
            <TableCell style={{ textAlign: "right" }}>
              <Space size="small">
                <Button size="sm" variant="ghost"><Pencil size={13} /></Button>
                <Button size="sm" variant="ghost"><MoreHorizontal size={13} /></Button>
              </Space>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Loading state — Skeleton in cells
// ─────────────────────────────────────────────────────────────────────────

export const Loading: Story = {
  name: "States — loading (Skeleton cells)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton style={{ height: 14, width: "70%" }} /></TableCell>
            <TableCell><Skeleton style={{ height: 14, width: "55%" }} /></TableCell>
            <TableCell><Skeleton style={{ height: 18, width: 64, borderRadius: 999 }} /></TableCell>
            <TableCell><Skeleton style={{ height: 14, width: "80%" }} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────

export const EmptyState: Story = {
  name: "States — empty (no rows)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={4} style={{ padding: 0 }}>
            <Empty description="No sandboxes yet">
              <Button size="sm" variant="primary">
                <Play size={13} /> Create sandbox
              </Button>
            </Empty>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Responsive (horizontal overflow)
// ─────────────────────────────────────────────────────────────────────────

export const Responsive: Story = {
  name: "Variants — wide table (horizontal scroll)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ maxWidth: 480, border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sandbox</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Dev</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last activity</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Plan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SANDBOXES.map((sb) => (
            <TableRow key={sb.id}>
              <TableCell style={{ whiteSpace: "nowrap" }}>{sb.name}</TableCell>
              <TableCell>{sb.project}</TableCell>
              <TableCell style={{ whiteSpace: "nowrap" }}>{sb.user.name}</TableCell>
              <TableCell>
                <Tag color={STATUS_TAG[sb.status].color}>{STATUS_TAG[sb.status].label}</Tag>
              </TableCell>
              <TableCell style={{ whiteSpace: "nowrap" }}>{sb.last}</TableCell>
              <TableCell>tokyo</TableCell>
              <TableCell>plan-38-v15</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Showcase
// ─────────────────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "Showcase — all variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Basic" size="small">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.slice(0, 3).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="With tags + avatars" size="small">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.slice(0, 3).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Space size="small" align="center">
                      <Avatar size="sm" color={u.color}>{u.name.charAt(0)}</Avatar>
                      <span>{u.name}</span>
                    </Space>
                  </TableCell>
                  <TableCell>
                    <Tag color={u.status === "active" ? "success" : "default"}>{u.status}</Tag>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Loading" size="small">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton style={{ height: 14, width: "70%" }} /></TableCell>
                  <TableCell><Skeleton style={{ height: 18, width: 60, borderRadius: 999 }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Empty" size="small">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2} style={{ padding: 0 }}>
                  <Empty description="Nothing here yet" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Col>
    </Row>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Realistic composition — Sandbox list with DropdownMenu actions
// ─────────────────────────────────────────────────────────────────────────

export const SandboxList: Story = {
  name: "Composition — Sandbox list",
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      title="Sandboxes"
      subtitle="All sandboxes you own + ones shared with you"
      extra={
        <Space size="small">
          <Button size="sm" variant="ghost">
            Filter <ChevronDown size={13} />
          </Button>
          <Button size="sm" variant="primary">
            <Play size={13} /> Create sandbox
          </Button>
        </Space>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sandbox</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last activity</TableHead>
            <TableHead style={{ textAlign: "right" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SANDBOXES.map((sb) => (
            <TableRow key={sb.id}>
              <TableCell>
                <Space size="middle" align="center">
                  <Avatar size="sm" shape="square" color={sb.user.color}>
                    {sb.user.name.charAt(0)}
                  </Avatar>
                  <Flex vertical gap={2}>
                    <span style={{ fontWeight: 500 }}>{sb.name}</span>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                      owner · {sb.user.name}
                    </span>
                  </Flex>
                </Space>
              </TableCell>
              <TableCell>
                <Space size="small" align="center">
                  <FolderGit2 size={13} />
                  <span>{sb.project}</span>
                </Space>
              </TableCell>
              <TableCell>
                <Tag color={STATUS_TAG[sb.status].color}>{STATUS_TAG[sb.status].label}</Tag>
              </TableCell>
              <TableCell>
                <Space size="small" align="center">
                  <Clock size={13} />
                  <span style={{ fontSize: 13 }}>{sb.last}</span>
                </Space>
              </TableCell>
              <TableCell style={{ textAlign: "right" }}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" aria-label="Sandbox actions">
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ExternalLink size={13} /> Open in VSCode
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {sb.status === "active" ? (
                        <>
                          <Square size={13} /> Stop
                        </>
                      ) : (
                        <>
                          <Play size={13} /> Start
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive size={13} /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Trash2 size={13} /> Destroy
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  ),
};
