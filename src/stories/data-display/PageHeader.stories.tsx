import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Filter, Download } from "lucide-react";
import { PageHeader } from "../../components/data-display/PageHeader";
import { Button } from "../../components/general/Button";
import { Breadcrumb } from "../../components/navigation/Breadcrumb";
import { Tabs } from "../../components/navigation/Tabs";

/**
 * data-display/PageHeader — page chrome strip with title + subtitle +
 * breadcrumb + actions + tabs + body slots.
 *
 * Documented props (per `PageHeader.tsx`):
 *   title:        ReactNode     primary h1 text
 *   subtitle?:    ReactNode     baseline-adjacent muted copy
 *   breadcrumb?:  ReactNode     row above the title (auto-stacks layout)
 *   actions?:     ReactNode     right-aligned slot (buttons / icon buttons)
 *   tabs?:        ReactNode     second-row tab strip
 *   body?:        ReactNode     third-row descriptive body
 *   variant?:     "compact" | "overflow" | "stacked"
 *
 * Per cardinal rule 25 stories drive the documented prop surface; visual
 * contract lives in `.ph` / `.ph-bar` / `.ph-title` / `.ph-actions` /
 * `.ph-tabs` / `.ph-body` classes in shell.css.
 */

const meta: Meta<typeof PageHeader> = {
  title: "Data Display/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**PageHeader** — canonical page chrome strip. Six slots compose the
header: \`title\`, \`subtitle\`, \`breadcrumb\`, \`actions\`, \`tabs\`,
\`body\`. The \`variant\` prop ("compact" / "overflow" / "stacked")
selects the layout; passing \`breadcrumb\` or \`tabs\` auto-promotes
"compact" to "stacked".
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

// ─── Default — title only ────────────────────────────────────────

export const Default: Story = {
  name: "Default · title only (compact)",
  render: () => <PageHeader title="従業員シフト · カレンダー" />,
};

// ─── WithBreadcrumb — auto-stacks layout ─────────────────────────

export const WithBreadcrumb: Story = {
  name: "WithBreadcrumb · auto-stacked layout",
  render: () => (
    <PageHeader
      breadcrumb={
        <Breadcrumb
          items={[
            { href: "#", label: "GoDX" },
            { href: "#", label: "勤怠" },
            { current: true, label: "月次レポート" },
          ]}
        />
      }
      title="店舗別 · 月次レポート"
    />
  ),
};

// ─── WithExtra — actions on the right ────────────────────────────

export const WithExtra: Story = {
  name: "WithExtra · primary + secondary actions",
  render: () => (
    <PageHeader
      title="従業員シフト · カレンダー"
      actions={
        <>
          <Button
            size="small"
            variant="secondary"
            startContent={<Filter size={14} aria-hidden />}
          >
            絞り込み
          </Button>
          <Button
            size="small"
            variant="primary"
            startContent={<Plus size={14} aria-hidden />}
          >
            一括割当
          </Button>
        </>
      }
    />
  ),
};

// ─── WithSubtitle — baseline-adjacent muted copy ─────────────────

export const WithSubtitle: Story = {
  name: "WithSubtitle · title + subtitle",
  render: () => (
    <PageHeader
      title="従業員シフト · カレンダー"
      subtitle="月単位の一括割当"
    />
  ),
};

// ─── AllSlots — breadcrumb + subtitle + actions + tabs + body ────

export const AllSlots: Story = {
  name: "AllSlots · breadcrumb + subtitle + actions + tabs + body",
  render: () => (
    <PageHeader
      variant="stacked"
      breadcrumb={
        <Breadcrumb
          items={[
            { href: "#", label: "GoDX" },
            { href: "#", label: "勤怠" },
            { current: true, label: "月次レポート" },
          ]}
        />
      }
      title="店舗別 · 月次レポート"
      subtitle="2026年5月"
      actions={
        <>
          <Button
            size="small"
            variant="secondary"
            startContent={<Download size={14} aria-hidden />}
          >
            CSV エクスポート
          </Button>
          <Button
            size="small"
            variant="primary"
            startContent={<Plus size={14} aria-hidden />}
          >
            新規申請
          </Button>
        </>
      }
      tabs={
        <Tabs
          defaultValue="overview"
          variant="line"
          items={[
            { value: "overview", label: "概要" },
            { value: "by-store", label: "店舗別" },
            { value: "by-staff", label: "担当者別" },
          ]}
        />
      }
      body="渋谷本店 · 田中 美咲 さんを含む 24 名のシフトを表示しています。"
    />
  ),
};
