import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { PageHeader } from "../components/primitives/PageHeader";
import { IconButton } from "../components/primitives/IconButton";
import { Button } from "../components/primitives/Button";
import { SegmentedControl } from "../components/primitives/SegmentedControl";
import { Input } from "../components/primitives/Input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSep,
} from "../components/primitives/Breadcrumb";
import { Space } from "../components/primitives/layout";

const meta: Meta<typeof PageHeader> = {
  title: "Primitives/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**PageHeader** — canonical page chrome with title + subtitle +
breadcrumb slot + action slot.

Mirrors the three reference patterns at
\`design-handoff/.../preview/comp-pageheader.html\`:

| Variant   | Description |
|-----------|-------------|
| \`compact\`  | One row. Title truncates with ellipsis. Actions never wrap (\`flex-shrink:0; white-space:nowrap\`). Use for index pages with a single primary CTA + 0–2 secondary actions. |
| \`overflow\` | One row. Primary action + 2–3 icon buttons + "…" overflow. Same height as \`compact\`; the variant flag just signals intent in the JSX. |
| \`stacked\`  | Two rows. Meta / breadcrumb + tabs go on a second row. Use when the page navigates between sub-views. Auto-promoted from \`compact\` when \`breadcrumb\` or \`tabs\` is passed. |

Atomic CSS lives in \`shell.css\` under \`.ph\` / \`.ph-bar\` /
\`.ph-title\` / \`.ph-actions\` / \`.ph-tabs\` / \`.ph-body\`.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  name: "Default — compact",
  parameters: { controls: { disable: true } },
  render: () => (
    <PageHeader
      title="従業員シフト · カレンダー"
      subtitle="月単位の一括割当"
    />
  ),
};

export const WithActions: Story = {
  name: "Variant — compact with actions",
  parameters: { controls: { disable: true } },
  render: () => (
    <PageHeader
      title="従業員シフト · カレンダー"
      subtitle="月単位の一括割当"
      actions={
        <>
          <IconButton variant="ghost" aria-label="戻る">
            <ArrowLeft size={14} />
          </IconButton>
          <Input
            type="month"
            defaultValue="2026-05"
            style={{ width: 130, height: 28, fontSize: 12 }}
          />
          <SegmentedControl
            items={[
              { value: "day", label: "日" },
              { value: "month", label: "月" },
            ]}
            defaultValue="month"
          />
          <Button size="sm">
            <Plus size={13} /> 一括割当
          </Button>
        </>
      }
      body={
        <>
          title <code>min-width:0 + text-overflow:ellipsis</code> · actions{" "}
          <code>flex-shrink:0 + white-space:nowrap</code>
        </>
      }
    />
  ),
};

export const Overflow: Story = {
  name: "Variant — overflow (1 primary + ⋯)",
  parameters: { controls: { disable: true } },
  render: () => (
    <PageHeader
      variant="overflow"
      title="勤怠承認キュー"
      subtitle="12 件 保留"
      actions={
        <>
          <IconButton aria-label="フィルタ">
            <Filter size={14} />
          </IconButton>
          <IconButton aria-label="エクスポート">
            <Download size={14} />
          </IconButton>
          <Button size="sm">一括承認</Button>
          <IconButton aria-label="その他">
            <MoreHorizontal size={14} />
          </IconButton>
        </>
      }
      body="quá 3 actions → 1 primary + ⋯ menu"
    />
  ),
};

export const WithBreadcrumb: Story = {
  name: "Variant — with breadcrumb (auto-stacks)",
  parameters: { controls: { disable: true } },
  render: () => (
    <PageHeader
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem href="/">ベトヤ</BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem href="/reports">レポート</BreadcrumbItem>
          <BreadcrumbSep />
          <BreadcrumbItem current>店舗別 · 月次レポート</BreadcrumbItem>
        </Breadcrumb>
      }
      title="店舗別 · 月次レポート"
      subtitle="ベトヤ · 渋谷店 / 表参道店 / 自由が丘店 — 2026年5月"
      actions={
        <>
          <Button size="sm" variant="secondary">
            CSV
          </Button>
          <Button size="sm" variant="secondary">
            PDF
          </Button>
          <Button size="sm">確定</Button>
        </>
      }
    />
  ),
};

export const Stacked: Story = {
  name: "Variant — stacked (tabs + body)",
  parameters: { controls: { disable: true } },
  render: () => (
    <PageHeader
      variant="stacked"
      title="店舗別 · 月次レポート"
      subtitle="ベトヤ · 渋谷店 / 表参道店 / 自由が丘店 — 2026年5月"
      actions={
        <Space size="small">
          <Button size="sm" variant="secondary">
            CSV
          </Button>
          <Button size="sm" variant="secondary">
            PDF
          </Button>
          <Button size="sm">確定</Button>
        </Space>
      }
      tabs={
        <>
          <a className="on">概要</a>
          <a>従業員別</a>
          <a>店舗別</a>
          <a>残業</a>
          <a>異常</a>
        </>
      }
      body="tabs ăn dòng riêng → header không phải gánh navigation + actions cùng lúc"
    />
  ),
};

export const ThreePatterns: Story = {
  name: "Showcase — three reference patterns",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <PageHeader
        title="従業員シフト · カレンダー"
        subtitle="月単位の一括割当"
        actions={
          <>
            <IconButton variant="ghost" aria-label="戻る">
              <ArrowLeft size={14} />
            </IconButton>
            <Input
              type="month"
              defaultValue="2026-05"
              style={{ width: 130, height: 28, fontSize: 12 }}
            />
            <SegmentedControl
              items={[
                { value: "day", label: "日" },
                { value: "month", label: "月" },
              ]}
              defaultValue="month"
            />
            <Button size="sm">
              <Plus size={13} /> 一括割当
            </Button>
          </>
        }
        body="① Compact · 1 hàng · title co lại bằng ellipsis, actions không bao giờ xuống dòng"
      />
      <PageHeader
        variant="overflow"
        title="勤怠承認キュー"
        subtitle="12 件 保留"
        actions={
          <>
            <IconButton aria-label="フィルタ">
              <Filter size={14} />
            </IconButton>
            <IconButton aria-label="エクスポート">
              <Download size={14} />
            </IconButton>
            <Button size="sm">一括承認</Button>
            <IconButton aria-label="その他">
              <MoreHorizontal size={14} />
            </IconButton>
          </>
        }
        body="② Overflow · primary + ⋯"
      />
      <PageHeader
        variant="stacked"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbItem href="/">ベトヤ</BreadcrumbItem>
            <BreadcrumbSep />
            <BreadcrumbItem current>店舗別 · 月次レポート</BreadcrumbItem>
          </Breadcrumb>
        }
        title="店舗別 · 月次レポート"
        subtitle="2026年5月"
        actions={
          <>
            <Button size="sm" variant="secondary">
              <CalendarDays size={13} /> 期間
            </Button>
            <Button size="sm">確定</Button>
          </>
        }
        tabs={
          <>
            <a className="on">概要</a>
            <a>従業員別</a>
            <a>店舗別</a>
            <a>残業</a>
            <a>異常</a>
          </>
        }
        body="③ Stacked · meta + tabs sang hàng dưới"
      />
    </Space>
  ),
};
