import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Activity,
  Bell,
  CreditCard,
  GitPullRequest,
  KeyRound,
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

The exports are thin wrappers around \`@radix-ui/react-tabs\`:

| Export | Wraps | Token class |
|---|---|---|
| \`Tabs\` | \`Root\` | — (passthrough — defines the controlled / uncontrolled state) |
| \`TabsList\` | \`List\` | \`.tabs\` |
| \`TabsTrigger\` | \`Trigger\` | \`.tab\` |
| \`TabsContent\` | \`Content\` | — (passthrough) |

**Controlled vs uncontrolled.** Pass \`defaultValue="<tab>"\` for
uncontrolled state, or \`value\` + \`onValueChange\` to drive the tab
from the parent — same Radix shape, same API.

**Orientation.** Radix Tabs supports horizontal (default) and
vertical. \`<Tabs orientation="vertical">\` flips the focus ring
behaviour (Up/Down instead of Left/Right). The token \`.tabs\` class
is horizontal by default; vertical layouts compose it inside a
\`<Flex>\` with \`vertical\` set.

**Accessibility (WCAG 2.1 AA)** — courtesy of Radix:

- \`<TabsList>\` renders \`role="tablist"\`.
- \`<TabsTrigger>\` renders \`role="tab"\` with \`aria-selected\` mirrored from \`data-state\` and \`tabindex\` managed across the list.
- \`<TabsContent>\` renders \`role="tabpanel"\` with \`aria-labelledby\` wired automatically.
- Keyboard: Left / Right (or Up / Down vertically) move focus across triggers; Home / End jump to first / last; Enter or Space activates.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

// ─────────────────────────────────────────────────────────────────────────
// Basic
// ─────────────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default — 3 horizontal tabs",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="overview" style={{ width: 520 }}>
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

export const TwoTabs: Story = {
  name: "Default — 2-tab editor / preview",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="edit" style={{ width: 480 }}>
      <TabsList>
        <TabsTrigger value="edit">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="edit" style={{ paddingTop: 16 }}>
        Markdown editor — write release notes here.
      </TabsContent>
      <TabsContent value="preview" style={{ paddingTop: 16 }}>
        Rendered preview — what readers will see.
      </TabsContent>
    </Tabs>
  ),
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
        <TabsTrigger value="done">
          Done
        </TabsTrigger>
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
            <Card title="Profile" size="small">
              Display name, locale, time zone.
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card title="Security" size="small">
              Sessions, 2FA, recovery codes.
            </Card>
          </TabsContent>
          <TabsContent value="billing">
            <Card title="Billing" size="small">
              Plan: Community. Next invoice: 2026-06-01.
            </Card>
          </TabsContent>
          <TabsContent value="audit">
            <Card title="Audit log" size="small">
              13 events in the last 7 days.
            </Card>
          </TabsContent>
        </div>
      </Flex>
    </Tabs>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Scrollable content
// ─────────────────────────────────────────────────────────────────────────

export const ScrollableContent: Story = {
  name: "Variants — scrollable content",
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="long" style={{ width: 560 }}>
      <TabsList>
        <TabsTrigger value="long">Long log</TabsTrigger>
        <TabsTrigger value="short">Short</TabsTrigger>
      </TabsList>
      <TabsContent
        value="long"
        style={{
          marginTop: 16,
          maxHeight: 240,
          overflowY: "auto",
          padding: 12,
          background: "var(--surface-2)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{ padding: "2px 0" }}>
            2026-05-15T09:{String(12 + (i % 48)).padStart(2, "0")}:30 INFO sandbox-service plan-38-v15 step {i + 1} OK
          </div>
        ))}
      </TabsContent>
      <TabsContent value="short" style={{ paddingTop: 16 }}>
        Just a few lines here.
      </TabsContent>
    </Tabs>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Nested tabs
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
        <Tabs defaultValue="profile">
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
// Showcase
// ─────────────────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "Showcase — all variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Basic" size="small">
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
      <Col xs={24} md={12}>
        <Card title="With disabled" size="small">
          <Tabs defaultValue="open">
            <TabsList>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="archived" disabled>Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="open" style={{ paddingTop: 12 }}>Open panel</TabsContent>
            <TabsContent value="closed" style={{ paddingTop: 12 }}>Closed panel</TabsContent>
            <TabsContent value="archived" style={{ paddingTop: 12 }}>Archived panel</TabsContent>
          </Tabs>
        </Card>
      </Col>
    </Row>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Realistic composition — Settings page with sub-tabs
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
            <Card variant="filled" size="small">
              <Flex justify="space-between" align="center">
                <Flex vertical gap={2}>
                  <span style={{ fontWeight: 500 }}>Recovery codes</span>
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Last regenerated 2026-04-22 — regenerate recommended
                  </span>
                </Flex>
                <Button size="sm" variant="secondary">Regenerate</Button>
              </Flex>
            </Card>
            <Card variant="filled" size="small">
              <Flex justify="space-between" align="center">
                <Flex vertical gap={2}>
                  <span style={{ fontWeight: 500 }}>Active sessions</span>
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    3 — Tokyo (this device), Osaka, Singapore
                  </span>
                </Flex>
                <Button size="sm" variant="ghost">Review</Button>
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
            <Separator />
            <Flex justify="space-between" align="center">
              <span>Deploy succeeded</span>
              <Tag>email</Tag>
            </Flex>
            <Separator />
            <Flex justify="space-between" align="center">
              <span>Chat mentions</span>
              <Tag color="success">push</Tag>
            </Flex>
          </Flex>
        </TabsContent>

        <TabsContent value="activity" style={{ paddingTop: 16 }}>
          <Flex vertical gap="small">
            <span style={{ fontSize: 13 }}>
              2026-05-15 09:12 — Created sandbox <code>sb-yuki-feat-forge-shell-align</code>
            </span>
            <span style={{ fontSize: 13 }}>
              2026-05-15 08:47 — Merged PR #1475 into <code>dev</code>
            </span>
            <span style={{ fontSize: 13 }}>
              2026-05-14 18:03 — Rotated personal access token
            </span>
          </Flex>
        </TabsContent>
      </Tabs>
    </Card>
  ),
};
