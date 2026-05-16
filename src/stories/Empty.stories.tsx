import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, FolderOpen, Search, Users, Mail, Bell, FileQuestion, PackageOpen } from "lucide-react";
import { Empty } from "../components/primitives/Empty";
import { Button } from "../components/primitives/Button";
import { Card } from "../components/primitives/Card";
import { Row, Col, Flex } from "../components/primitives/layout";

/**
 * Empty — Ant-Design empty-state placeholder.
 *
 * Three slots:
 * - **image** — illustration / icon (defaults to a folder SVG).
 * - **description** — short text below the image.
 * - **children** — action area (typically a Button).
 *
 * Where it fits: empty tables, empty lists, search-no-results, dashboards
 * before first data lands.
 */
const meta: Meta<typeof Empty> = {
  title: "Primitives/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Empty-state placeholder with image + description + action " +
          "slots. Pairs naturally with Card (empty card body), Table " +
          "(empty data state), and Button (the primary action).",
      },
    },
  },
  argTypes: {
    description: { control: { type: "text" } },
  },
};
export default meta;
type Story = StoryObj<typeof Empty>;

/** Live Controls playground. */
export const Playground: Story = {
  args: { description: "No data" },
};

// ---------------------------------------------------------------------------
// Default illustration
// ---------------------------------------------------------------------------

export const Default: Story = { args: { description: "データがありません" } };

export const NoDescription: Story = { args: {} };

export const LongDescription: Story = {
  args: {
    description:
      "プロジェクトがまだ作成されていません。最初のプロジェクトを作成すると、ここにダッシュボードが表示されます。",
  },
};

// ---------------------------------------------------------------------------
// Custom image / icon
// ---------------------------------------------------------------------------

export const CustomIconInbox: Story = {
  args: {
    image: <Inbox size={48} strokeWidth={1.2} />,
    description: "No notifications yet",
  },
};

export const CustomIconSearch: Story = {
  args: {
    image: <Search size={48} strokeWidth={1.2} />,
    description: "No results match your filter",
  },
};

export const CustomIconUsers: Story = {
  args: {
    image: <Users size={48} strokeWidth={1.2} />,
    description: "No team members yet",
  },
};

export const CustomIconPackage: Story = {
  args: {
    image: <PackageOpen size={48} strokeWidth={1.2} />,
    description: "Your storage is empty",
  },
};

export const CustomSvgImage: Story = {
  args: {
    image: (
      <svg width="96" height="72" viewBox="0 0 96 72" aria-hidden="true">
        <rect x="6" y="14" width="84" height="48" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
        <path d="M6 28h84" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
        <circle cx="14" cy="21" r="2" fill="currentColor" opacity="0.6" />
        <circle cx="22" cy="21" r="2" fill="currentColor" opacity="0.6" />
        <circle cx="30" cy="21" r="2" fill="currentColor" opacity="0.6" />
        <ellipse cx="48" cy="66" rx="36" ry="3" fill="currentColor" opacity="0.1" />
      </svg>
    ),
    description: "No window open",
  },
};

// ---------------------------------------------------------------------------
// With action slot
// ---------------------------------------------------------------------------

export const WithAction: Story = {
  args: {
    description: "Your inbox is empty",
    children: <Button>Compose message</Button>,
  },
};

export const WithMultipleActions: Story = {
  args: {
    description: "プロジェクトがありません",
    children: (
      <Flex gap="small">
        <Button variant="secondary">テンプレートから作成</Button>
        <Button>新規プロジェクト</Button>
      </Flex>
    ),
  },
};

// ---------------------------------------------------------------------------
// Realistic compositions
// ---------------------------------------------------------------------------

export const NoProjectsYet: Story = {
  name: "Composition — No projects yet",
  render: () => (
    <Card title="プロジェクト" extra={<Button size="sm">新規作成</Button>}>
      <Empty
        image={<FolderOpen size={56} strokeWidth={1.2} />}
        description="プロジェクトがまだ作成されていません"
      >
        <Button>新規プロジェクトを作成</Button>
      </Empty>
    </Card>
  ),
};

export const EmptyTable: Story = {
  name: "Composition — Empty table",
  render: () => (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          padding: "10px 12px",
          background: "var(--muted)",
          color: "var(--muted-foreground)",
          fontSize: 12,
        }}
      >
        <span>Issue</span>
        <span>Title</span>
        <span>Status</span>
        <span>Owner</span>
      </div>
      <div style={{ padding: 24 }}>
        <Empty
          image={<FileQuestion size={48} strokeWidth={1.2} />}
          description="No issues match your filters"
        >
          <Button variant="secondary">Reset filters</Button>
        </Empty>
      </div>
    </div>
  ),
};

export const EmptyCard: Story = {
  name: "Composition — Empty card body",
  render: () => (
    <Card title="未読の通知" extra={<a href="#">All →</a>} style={{ width: 360 }}>
      <Empty
        image={<Bell size={48} strokeWidth={1.2} />}
        description="新しい通知はありません"
      />
    </Card>
  ),
};

export const SearchNoResults: Story = {
  name: "Composition — Search no results",
  render: () => (
    <Card style={{ width: 480 }}>
      <Empty
        image={<Search size={48} strokeWidth={1.2} />}
        description={
          <Flex vertical gap="small" align="center">
            <span>「forge-zealand-edge」 に一致する結果はありません</span>
            <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
              キーワードを変更するかフィルターをリセットしてください
            </span>
          </Flex>
        }
      >
        <Button variant="ghost">Reset filters</Button>
      </Empty>
    </Card>
  ),
};

export const InboxZero: Story = {
  name: "Composition — Inbox zero",
  render: () => (
    <Card title="Inbox" extra={<Button variant="ghost" size="sm">Mark all read</Button>} style={{ width: 420 }}>
      <Empty
        image={<Mail size={48} strokeWidth={1.2} />}
        description="未読メッセージはありません"
      >
        <Button variant="secondary">Compose</Button>
      </Empty>
    </Card>
  ),
};

// ---------------------------------------------------------------------------
// Showcase — full matrix
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: "Showcase — variants side-by-side",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Card title="Default image">
          <Empty description="No data" />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="Custom icon (Inbox)">
          <Empty image={<Inbox size={48} strokeWidth={1.2} />} description="No notifications" />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="Custom icon (Search)">
          <Empty image={<Search size={48} strokeWidth={1.2} />} description="No results" />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="No description">
          <Empty />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="With action">
          <Empty description="プロジェクトがありません">
            <Button>新規作成</Button>
          </Empty>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="With two actions">
          <Empty
            image={<Users size={48} strokeWidth={1.2} />}
            description="メンバーがいません"
          >
            <Flex gap="small">
              <Button variant="secondary">招待</Button>
              <Button>追加</Button>
            </Flex>
          </Empty>
        </Card>
      </Col>
    </Row>
  ),
};
