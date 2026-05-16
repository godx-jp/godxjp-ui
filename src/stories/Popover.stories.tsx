import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CalendarDays, HelpCircle, MoreHorizontal, User } from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "../components/primitives/Popover";
import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";
import { Label } from "../components/primitives/Label";
import { Avatar } from "../components/primitives/Avatar";
import { Flex } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/Popover",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Popover** — floating non-modal panel anchored to a trigger,
wrapping
[\`@radix-ui/react-popover\`](https://www.radix-ui.com/primitives/docs/components/popover).
Use for transient content tied to a control: date pickers, quick
edits, helper text, avatar / user meta cards. Unlike Dialog, the
underlying page stays interactive.

The primitive exports \`Popover\`, \`PopoverTrigger\`,
\`PopoverContent\`, and \`PopoverAnchor\`. Use \`PopoverAnchor\` when
the visual trigger and the positioning anchor must differ (icon
opens but anchors next to the input next to it).

### Keyboard navigation

- **Space** / **Enter** on the trigger — opens the popover.
- **Esc** — closes and returns focus to the trigger.
- **Tab** / **Shift+Tab** — moves focus through interactive elements
  inside the popover, then on to the next focusable element after
  the trigger (popover is NOT a focus trap).
- Clicking outside dismisses (configurable via Radix props).

### Accessibility (WCAG 2.1 AA)

- Radix manages \`aria-expanded\`, \`aria-controls\`, and the
  \`role="dialog"\` association on \`PopoverContent\`.
- Focus visibly moves into the popover on open if the first focusable
  child should receive it (set via \`onOpenAutoFocus\`).
- Respects \`prefers-reduced-motion\` through the
  \`.popover-content\` token classes.
- \`sideOffset\` defaults to 6 px so the panel doesn't visually collide
  with the trigger's focus ring.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ fontSize: "var(--font-size-sm)" }}>
          Popover content — non-modal, portal rendered, keyboard
          dismissible via Esc.
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const AnchoredToButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Trigger doubles as the positioning anchor. The default — use " +
          "for most quick-action menus.",
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open</Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Flex vertical gap="small">
          <strong>Quick actions</strong>
          <Button variant="ghost" size="sm">
            Duplicate worktree
          </Button>
          <Button variant="ghost" size="sm">
            Rename branch
          </Button>
          <Button variant="ghost" size="sm">
            Open in VSCode
          </Button>
        </Flex>
      </PopoverContent>
    </Popover>
  ),
};

export const AnchoredToIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Compact icon trigger — common for kebab menus, help icons, " +
          "and inline metadata reveals.",
      },
    },
  },
  render: () => (
    <Flex align="center" gap="small">
      <span style={{ fontSize: "var(--font-size-sm)" }}>
        Inter-service auth model
      </span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="More info">
            <HelpCircle size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--font-size-sm)" }}>
              RFC 8693 Token Exchange
            </strong>
            <p style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
              Inbound user JWT → exchanged at the gateway for an
              audience-scoped service token. Callees verify <code>aud</code>
              + signature; no shared bearers.
            </p>
          </Flex>
        </PopoverContent>
      </Popover>
    </Flex>
  ),
};

export const DatePickerPattern: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Form-inside-popover composition — replicates the lightweight " +
          "date-picker pattern. For a full calendar widget, use the " +
          "Calendar primitive instead.",
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">
          <CalendarDays size={14} /> Pick date range
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Flex vertical gap="middle">
          <Flex vertical gap="small">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" defaultValue="2026-05-01" />
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" defaultValue="2026-05-16" />
          </Flex>
          <Flex justify="end" gap="small">
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
            <Button size="sm">Apply</Button>
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  ),
};

export const UserMetaCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Rich content — avatar + identity + secondary actions. Common " +
          "on mention chips, assignee badges, and audit-log actor links.",
      },
    },
  },
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <User size={14} /> @satoshi
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Flex gap="middle" align="start">
          <Avatar size="lg" variant="brand">SN</Avatar>
          <Flex vertical gap="small" flex={1}>
            <Flex vertical gap="small">
              <strong style={{ fontSize: "var(--font-size-sm)" }}>
                Satoshi Nakamoto
              </strong>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--muted-foreground)",
                }}
              >
                satoshi@famgia.com · human
              </span>
            </Flex>
            <span style={{ fontSize: "var(--font-size-xs)" }}>
              3 active sandboxes · 12 open PRs
            </span>
            <Flex gap="small">
              <Button size="sm" variant="secondary">
                View profile
              </Button>
              <Button size="sm" variant="ghost">
                Message
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  ),
};

export const WithAnchor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`PopoverAnchor` lets the visual trigger differ from the " +
          "positioning anchor — useful when an icon button should open a " +
          "popover that aligns to the adjacent input.",
      },
    },
  },
  render: () => (
    <Flex align="center" gap="small">
      <PopoverAnchor>
        <Input placeholder="search…" style={{ width: 240 }} />
      </PopoverAnchor>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Recent searches">
            <MoreHorizontal size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <Flex vertical gap="small">
            <strong style={{ fontSize: "var(--font-size-sm)" }}>
              Recent searches
            </strong>
            <Button variant="ghost" size="sm">
              actor_kind=ai_agent
            </Button>
            <Button variant="ghost" size="sm">
              audit.entry.recorded
            </Button>
            <Button variant="ghost" size="sm">
              sandbox.created
            </Button>
          </Flex>
        </PopoverContent>
      </Popover>
    </Flex>
  ),
};

export const Uncontrolled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Radix manages open / close. Use `defaultOpen` to start with " +
          "the popover visible.",
      },
    },
  },
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="secondary">Re-open</Button>
      </PopoverTrigger>
      <PopoverContent>
        <span style={{ fontSize: "var(--font-size-sm)" }}>
          Opened via <code>defaultOpen</code> — Radix internal state from
          here on.
        </span>
      </PopoverContent>
    </Popover>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Lift open state to the parent to drive the popover from " +
          "external events.",
      },
    },
  },
  render: function ControlledRender() {
    const [open, setOpen] = useState(false);
    return (
      <Flex vertical gap="middle" align="start">
        <Flex gap="small">
          <Button onClick={() => setOpen(true)}>Open externally</Button>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={!open}>
            Close externally
          </Button>
        </Flex>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--muted-foreground)" }}>
          External state: <code>{String(open)}</code>
        </span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost">Anchored trigger</Button>
          </PopoverTrigger>
          <PopoverContent>
            <span style={{ fontSize: "var(--font-size-sm)" }}>
              Open state lives in the parent via <code>useState</code>.
            </span>
          </PopoverContent>
        </Popover>
      </Flex>
    );
  },
};
