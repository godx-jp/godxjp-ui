import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Activity,
  Bell,
  Calendar as CalendarIcon,
  CreditCard,
  GitPullRequest,
  KeyRound,
  List,
  Lock,
  Mail,
  MessageSquare,
  Settings,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/primitives/Tabs";
import { Flex, Space, Row, Col } from "../components/primitives/layout";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tag } from "../components/primitives/Tag";
import { Badge } from "../components/primitives/Badge";
import { Separator } from "../components/primitives/Separator";

const meta: Meta<typeof Tabs> = {
  title: "Primitives/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Tabs** — segmented content switcher backed by Radix UI Tabs.

The visual contract follows the dxs-kintai design system, with two variants:

| Variant | Token classes | Usage |
|---|---|---|
| \`line\` (default) | \`.tabs\` / \`.tab\` | Top-level page tabs (radix-style underline). |
| \`pills\` | \`.tabs-pills\` / \`.tabs-pill\` | Segmented control (day / week / month). |

| Export | Wraps |
|---|---|
| \`Tabs\` | \`Root\` — accepts \`variant\` |
| \`TabsList\` | \`List\` — picks the class from the variant context |
| \`TabsTrigger\` | \`Trigger\` |
| \`TabsContent\` | \`Content\` |

**Accessibility (WCAG 2.1 AA)** — courtesy of Radix:
\`<TabsList>\` renders \`role="tablist"\`, \`<TabsTrigger>\` renders \`role="tab"\`,
\`<TabsContent>\` renders \`role="tabpanel"\` with \`aria-labelledby\` wired automatically.
Keyboard: arrow keys move focus across triggers; Home / End jump to first / last;
Enter or Space activates.
        `.trim(),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["line", "pills"],
      description: "Visual variant — line (default) or segmented pills.",
      table: { defaultValue: { summary: "line" } },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

// ─────────────────────────────────────────────────────────────────────────
// Playground
// ─────────────────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: { variant: "line", defaultValue: "overview" },
  render: (args) => (
    <Tabs {...args} style={{ width: 520 }}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" style={{ paddingTop: 16 }}>
        Overview panel — 12 active sandboxes, 7 open PRs, last deploy 2026-05-15.
      </TabsContent>
      <TabsContent value="activity" style={{ paddingTop: 16 }}>
        Activity panel — recent commits, PR merges, deploys.
      </TabsContent>
      <TabsContent value="settings" style={{ paddingTop: 16 }}>
        Settings panel — display name, locale, dark mode preference.
      </TabsContent>
    </Tabs>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Line variant — canonical radix-style underline
// ─────────────────────────────────────────────────────────────────────────

export const Line: Story = {
  name: "Line — radix-style underline",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="calendar" variant="line" style={{ width: 520 }}>
      <TabsList>
        <TabsTrigger value="calendar">
          <CalendarIcon size={14} /> カレンダー
        </TabsTrigger>
        <TabsTrigger value="list">
          <List size={14} /> リスト
        </TabsTrigger>
        <TabsTrigger value="requests">
          変更申請
          <Badge variant="error" style={{ marginLeft: 6 }}>2</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="calendar" style={{ paddingTop: 16, color: "var(--muted-foreground)", fontSize: 13 }}>
        タブ内容 (カレンダーグリッド) — 個別データを表示。
      </TabsContent>
      <TabsContent value="list" style={{ paddingTop: 16, color: "var(--muted-foreground)", fontSize: 13 }}>
        タブ内容 (リスト) — 行ごとに勤怠記録を表示。
      </TabsContent>
      <TabsContent value="requests" style={{ paddingTop: 16, color: "var(--muted-foreground)", fontSize: 13 }}>
        タブ内容 (変更申請) — 承認待ち 2 件。
      </TabsContent>
    </Tabs>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Pills variant — segmented control
// ─────────────────────────────────────────────────────────────────────────

export const Pills: Story = {
  name: "Pills — segmented control",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle" align="start">
      <Tabs defaultValue="day" variant="pills">
        <TabsList>
          <TabsTrigger value="day">日</TabsTrigger>
          <TabsTrigger value="week">週</TabsTrigger>
          <TabsTrigger value="month">月</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="active" variant="pills">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>
    </Flex>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Segmented control — day / week / month with content
// ─────────────────────────────────────────────────────────────────────────

function SegmentedControlDemo() {
  const [range, setRange] = useState("day");
  const label = range === "day" ? "本日" : range === "week" ? "今週" : "今月";
  return (
    <Flex vertical gap="middle" style={{ width: 480 }}>
      <Tabs value={range} onValueChange={setRange} variant="pills">
        <TabsList>
          <TabsTrigger value="day">日</TabsTrigger>
          <TabsTrigger value="week">週</TabsTrigger>
          <TabsTrigger value="month">月</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card title={`勤怠 — ${label}`} size="small">
        <Flex justify="space-between">
          <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>合計時間</span>
          <span style={{ fontWeight: 500 }}>
            {range === "day" ? "8h 12m" : range === "week" ? "39h 06m" : "168h 32m"}
          </span>
        </Flex>
      </Card>
    </Flex>
  );
}

export const SegmentedControl: Story = {
  name: "Pills — segmented day / week / month",
  parameters: { controls: { disable: true } },
  render: () => <SegmentedControlDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Disabled
// ─────────────────────────────────────────────────────────────────────────

export const WithDisabledTab: Story = {
  name: "States — disabled tab",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="account" style={{ width: 520 }}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="export" disabled>
          Export (Pro only)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account" style={{ paddingTop: 16 }}>
        Account info — name, avatar, pronouns.
      </TabsContent>
      <TabsContent value="billing" style={{ paddingTop: 16 }}>
        Billing — current plan: Community.
      </TabsContent>
      <TabsContent value="export" style={{ paddingTop: 16 }}>
        Export your data as JSON. (Requires Pro.)
      </TabsContent>
    </Tabs>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Icons + Badges in triggers
// ─────────────────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  name: "Variants — icon + text triggers",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="profile" style={{ width: 560 }}>
      <TabsList>
        <TabsTrigger value="profile">
          <User size={14} /> Profile
        </TabsTrigger>
        <TabsTrigger value="security">
          <Lock size={14} /> Security
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell size={14} /> Notifications
        </TabsTrigger>
        <TabsTrigger value="api">
          <KeyRound size={14} /> API tokens
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" style={{ paddingTop: 16 }}>
        Profile fields — display name, locale, time zone (Asia/Tokyo).
      </TabsContent>
      <TabsContent value="security" style={{ paddingTop: 16 }}>
        Sessions, 2FA, recovery codes.
      </TabsContent>
      <TabsContent value="notifications" style={{ paddingTop: 16 }}>
        Email, push, in-app preferences.
      </TabsContent>
      <TabsContent value="api" style={{ paddingTop: 16 }}>
        Generate + revoke personal access tokens.
      </TabsContent>
    </Tabs>
  ),
};

export const WithBadges: Story = {
  name: "Variants — badge counts in triggers",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="inbox" style={{ width: 560 }}>
      <TabsList>
        <TabsTrigger value="inbox">
          <Mail size={14} /> Inbox
          <Badge variant="info" style={{ marginLeft: 6 }}>12</Badge>
        </TabsTrigger>
        <TabsTrigger value="mentions">
          <MessageSquare size={14} /> Mentions
          <Badge variant="warning" style={{ marginLeft: 6 }}>3</Badge>
        </TabsTrigger>
        <TabsTrigger value="prs">
          <GitPullRequest size={14} /> PRs
          <Badge variant="info" style={{ marginLeft: 6 }}>7</Badge>
        </TabsTrigger>
        <TabsTrigger value="done">Done</TabsTrigger>
      </TabsList>
      <TabsContent value="inbox" style={{ paddingTop: 16 }}>
        12 new notifications since 2026-05-15.
      </TabsContent>
      <TabsContent value="mentions" style={{ paddingTop: 16 }}>
        3 mentions in chat / PR review.
      </TabsContent>
      <TabsContent value="prs" style={{ paddingTop: 16 }}>
        7 open PRs awaiting your review.
      </TabsContent>
      <TabsContent value="done" style={{ paddingTop: 16 }}>
        Archive — nothing to show.
      </TabsContent>
    </Tabs>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Controlled
// ─────────────────────────────────────────────────────────────────────────

function ControlledTabsDemo() {
  const [tab, setTab] = useState("alpha");
  return (
    <Flex vertical gap="middle" style={{ width: 560 }}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="alpha">Alpha</TabsTrigger>
          <TabsTrigger value="beta">Beta</TabsTrigger>
          <TabsTrigger value="gamma">Gamma</TabsTrigger>
        </TabsList>
        <TabsContent value="alpha" style={{ paddingTop: 16 }}>
          Alpha content — controlled by the parent state ({tab}).
        </TabsContent>
        <TabsContent value="beta" style={{ paddingTop: 16 }}>
          Beta content.
        </TabsContent>
        <TabsContent value="gamma" style={{ paddingTop: 16 }}>
          Gamma content.
        </TabsContent>
      </Tabs>
      <Space size="small">
        <Button size="sm" variant="ghost" onClick={() => setTab("alpha")}>Go to Alpha</Button>
        <Button size="sm" variant="ghost" onClick={() => setTab("beta")}>Go to Beta</Button>
        <Button size="sm" variant="ghost" onClick={() => setTab("gamma")}>Go to Gamma</Button>
        <Tag color="info">value: {tab}</Tag>
      </Space>
    </Flex>
  );
}

export const Controlled: Story = {
  name: "States — controlled (programmatic switching)",
  parameters: { controls: { disable: true } },
  render: () => <ControlledTabsDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Vertical orientation
// ─────────────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  name: "Variants — vertical orientation",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="profile" orientation="vertical">
      <Flex gap="large" align="start">
        <TabsList
          aria-orientation="vertical"
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            minWidth: 180,
            borderBottom: "none",
            borderRight: "1px solid var(--border)",
          }}
        >
          <TabsTrigger value="profile" style={{ justifyContent: "flex-start" }}>
            <User size={14} /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" style={{ justifyContent: "flex-start" }}>
            <Lock size={14} /> Security
          </TabsTrigger>
          <TabsTrigger value="billing" style={{ justifyContent: "flex-start" }}>
            <CreditCard size={14} /> Billing
          </TabsTrigger>
          <TabsTrigger value="audit" style={{ justifyContent: "flex-start" }}>
            <ShieldCheck size={14} /> Audit log
          </TabsTrigger>
        </TabsList>
        <div style={{ flex: 1, minWidth: 280 }}>
          <TabsContent value="profile">
            <Card title="Profile" size="small">Display name, locale, time zone.</Card>
          </TabsContent>
          <TabsContent value="security">
            <Card title="Security" size="small">Sessions, 2FA, recovery codes.</Card>
          </TabsContent>
          <TabsContent value="billing">
            <Card title="Billing" size="small">Plan: Community. Next invoice: 2026-06-01.</Card>
          </TabsContent>
          <TabsContent value="audit">
            <Card title="Audit log" size="small">13 events in the last 7 days.</Card>
          </TabsContent>
        </div>
      </Flex>
    </Tabs>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Nested
// ─────────────────────────────────────────────────────────────────────────

export const Nested: Story = {
  name: "Variants — nested tabs",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="account" style={{ width: 640 }}>
      <TabsList>
        <TabsTrigger value="account">
          <UserCog size={14} /> Account
        </TabsTrigger>
        <TabsTrigger value="workspace">
          <Settings size={14} /> Workspace
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account" style={{ paddingTop: 16 }}>
        <Tabs defaultValue="profile" variant="pills">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" style={{ paddingTop: 16 }}>
            Inner — profile fields.
          </TabsContent>
          <TabsContent value="security" style={{ paddingTop: 16 }}>
            Inner — sessions + 2FA.
          </TabsContent>
          <TabsContent value="notifications" style={{ paddingTop: 16 }}>
            Inner — email + push preferences.
          </TabsContent>
        </Tabs>
      </TabsContent>
      <TabsContent value="workspace" style={{ paddingTop: 16 }}>
        Workspace settings — region, default sandbox image, idle timeout.
      </TabsContent>
    </Tabs>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// All variants showcase
// ─────────────────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "Showcase — all variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Line — basic" size="small">
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">A</TabsTrigger>
              <TabsTrigger value="b">B</TabsTrigger>
              <TabsTrigger value="c">C</TabsTrigger>
            </TabsList>
            <TabsContent value="a" style={{ paddingTop: 12 }}>Panel A</TabsContent>
            <TabsContent value="b" style={{ paddingTop: 12 }}>Panel B</TabsContent>
            <TabsContent value="c" style={{ paddingTop: 12 }}>Panel C</TabsContent>
          </Tabs>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Pills — segmented" size="small">
          <Tabs defaultValue="week" variant="pills">
            <TabsList>
              <TabsTrigger value="day">日</TabsTrigger>
              <TabsTrigger value="week">週</TabsTrigger>
              <TabsTrigger value="month">月</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="With icons" size="small">
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile"><User size={14} /> Profile</TabsTrigger>
              <TabsTrigger value="security"><Lock size={14} /> Security</TabsTrigger>
              <TabsTrigger value="bell"><Bell size={14} /> Notifs</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" style={{ paddingTop: 12 }}>Profile panel</TabsContent>
            <TabsContent value="security" style={{ paddingTop: 12 }}>Security panel</TabsContent>
            <TabsContent value="bell" style={{ paddingTop: 12 }}>Notifications panel</TabsContent>
          </Tabs>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="With badges" size="small">
          <Tabs defaultValue="inbox">
            <TabsList>
              <TabsTrigger value="inbox">
                Inbox <Badge variant="info" style={{ marginLeft: 6 }}>12</Badge>
              </TabsTrigger>
              <TabsTrigger value="mentions">
                Mentions <Badge variant="warning" style={{ marginLeft: 6 }}>3</Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inbox" style={{ paddingTop: 12 }}>Inbox panel</TabsContent>
            <TabsContent value="mentions" style={{ paddingTop: 12 }}>Mentions panel</TabsContent>
          </Tabs>
        </Card>
      </Col>
    </Row>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Settings page composition
// ─────────────────────────────────────────────────────────────────────────

export const SettingsPage: Story = {
  name: "Composition — Settings page",
  parameters: { controls: { disable: true } },
  render: () => (
    <Card title="Settings" subtitle="Manage your account, security, and notifications.">
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User size={14} /> Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck size={14} /> Security
            <Badge variant="warning" style={{ marginLeft: 6 }}>1</Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell size={14} /> Notifications
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity size={14} /> Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" style={{ paddingTop: 16 }}>
          <Flex vertical gap="middle">
            <Space size="middle" align="center">
              <span style={{ fontWeight: 500 }}>Display name</span>
              <span>Yuki Tanaka</span>
            </Space>
            <Separator />
            <Space size="middle" align="center">
              <span style={{ fontWeight: 500 }}>Locale</span>
              <span>ja-JP</span>
            </Space>
            <Separator />
            <Space size="middle" align="center">
              <span style={{ fontWeight: 500 }}>Time zone</span>
              <span>Asia/Tokyo</span>
            </Space>
          </Flex>
        </TabsContent>
        <TabsContent value="security" style={{ paddingTop: 16 }}>
          <Flex vertical gap="middle">
            <Card variant="filled" size="small">
              <Flex justify="space-between" align="center">
                <Flex vertical gap={2}>
                  <span style={{ fontWeight: 500 }}>Two-factor authentication</span>
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Enabled via authenticator app
                  </span>
                </Flex>
                <Tag color="success">on</Tag>
              </Flex>
            </Card>
          </Flex>
        </TabsContent>
        <TabsContent value="notifications" style={{ paddingTop: 16 }}>
          <Flex vertical gap="middle">
            <Flex justify="space-between" align="center">
              <span>PR review requests</span>
              <Tag color="success">email + push</Tag>
            </Flex>
          </Flex>
        </TabsContent>
        <TabsContent value="activity" style={{ paddingTop: 16 }}>
          <Flex vertical gap="small">
            <span style={{ fontSize: 13 }}>
              2026-05-15 09:12 — Created sandbox <code>sb-yuki-feat-forge-shell-align</code>
            </span>
          </Flex>
        </TabsContent>
      </Tabs>
    </Card>
  ),
};
