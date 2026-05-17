import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Filter, Settings2, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/primitives/Sheet";
import { Button } from "../components/primitives/Button";
import { Input, Textarea } from "../components/primitives/Input";
import { Label } from "../components/primitives/Label";
import { Checkbox } from "../components/primitives/Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/primitives/Select";
import { Flex } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/Sheet",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Sheet** — slide-over panel built on
[\`@radix-ui/react-dialog\`](https://www.radix-ui.com/primitives/docs/components/dialog).
Same accessibility model as Dialog (focus trap, scroll lock,
\`role="dialog"\`, \`aria-modal\`) but presented as an edge-anchored
panel instead of a centered card. The \`side\` prop controls anchor:
\`"left"\`, \`"right"\` (default), \`"top"\`, or \`"bottom"\`.

Use for secondary tasks that benefit from staying anchored to the
trigger context — filters, settings, nav, detail inspectors — where
the user expects to dismiss and return to the underlying surface.

### Keyboard navigation

- **Esc** — closes the sheet.
- **Tab** / **Shift+Tab** — cycles focus inside the panel; the trap
  prevents focus from leaking back to the main document.
- **Enter** — submits the focused button.
- Focus returns to the trigger on close.

### Accessibility (WCAG 2.1 AA)

- Same Radix Dialog wiring as the Dialog primitive: \`role="dialog"\`,
  \`aria-modal="true"\`, Title/Description tied through ARIA.
- The panel animates respecting \`prefers-reduced-motion\` (motion
  contract lives in \`tokens.css\`).
- \`data-side\` on \`SheetContent\` lets consumers customise per-side
  shadow + radius without re-implementing the primitive.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Profile settings</SheetTitle>
          <SheetDescription>
            Edit display name, avatar, pronouns.
          </SheetDescription>
        </SheetHeader>
        <div style={{ padding: "var(--spacing-3)" }}>Form content here.</div>
      </SheetContent>
    </Sheet>
  ),
};

export const SideRight: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open right</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Right-anchored</SheetTitle>
          <SheetDescription>
            Default side. Use for the primary detail / edit panel.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const SideLeft: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open left</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Left side is conventional for primary navigation drawers on
            mobile viewports.
          </SheetDescription>
        </SheetHeader>
        <Flex vertical gap="small" style={{ padding: "var(--spacing-3)" }}>
          <a href="#">Dashboard</a>
          <a href="#">Projects</a>
          <a href="#">Sandboxes</a>
          <a href="#">Audit log</a>
        </Flex>
      </SheetContent>
    </Sheet>
  ),
};

export const SideTop: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open top</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Command palette</SheetTitle>
          <SheetDescription>
            Top side is good for search / command bars that drop in from
            the address bar.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const SideBottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open bottom</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Quick actions</SheetTitle>
          <SheetDescription>
            Bottom side mirrors a mobile action sheet pattern.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const FilterPanel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Real-world composition: a filter panel anchored right with " +
          "Checkbox + Select + footer Apply / Clear actions. Mirrors the " +
          "shape used by `admin-platform` audit list.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <Filter size={14} /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filter audit log</SheetTitle>
          <SheetDescription>
            Narrow the entry list by actor, action, and time window.
          </SheetDescription>
        </SheetHeader>
        <Flex vertical gap="middle" style={{ padding: "var(--spacing-3)" }}>
          <Flex vertical gap="small">
            <Label>Actor kind</Label>
            <Flex vertical gap="small">
              <Flex align="center" gap="small">
                <Checkbox id="actor-human" defaultChecked />
                <Label htmlFor="actor-human">human</Label>
              </Flex>
              <Flex align="center" gap="small">
                <Checkbox id="actor-service" />
                <Label htmlFor="actor-service">service</Label>
              </Flex>
              <Flex align="center" gap="small">
                <Checkbox id="actor-ai" />
                <Label htmlFor="actor-ai">ai_agent</Label>
              </Flex>
            </Flex>
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="window">Window</Label>
            <Select defaultValue="24h">
              <SelectTrigger id="window">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="actor-id">Actor user ID</Label>
            <Input id="actor-id" placeholder="zitadel:user:…" />
          </Flex>
        </Flex>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="secondary">Clear</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Apply</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const SettingsPanel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Settings panel with mixed inputs — Input, Select, Textarea, " +
          "Checkbox. Useful for inline preference edits that don't " +
          "warrant a full-page route.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Settings2 size={14} /> Settings
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Workspace settings</SheetTitle>
          <SheetDescription>
            Applies to every member of <code>godx-admin</code>.
          </SheetDescription>
        </SheetHeader>
        <Flex vertical gap="middle" style={{ padding: "var(--spacing-3)" }}>
          <Flex vertical gap="small">
            <Label htmlFor="ws-name">Workspace name</Label>
            <Input id="ws-name" defaultValue="godx-admin" />
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="ws-tz">Default timezone</Label>
            <Select defaultValue="asia-tokyo">
              <SelectTrigger id="ws-tz">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asia-tokyo">Asia/Tokyo</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="us-pacific">US/Pacific</SelectItem>
              </SelectContent>
            </Select>
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="ws-bio">Description</Label>
            <Textarea
              id="ws-bio"
              rows={3}
              defaultValue="Multi-deployment dev workspace platform."
            />
          </Flex>
          <Flex align="center" gap="small">
            <Checkbox id="audit" defaultChecked />
            <Label htmlFor="audit">Mirror audit events to reporting-service</Label>
          </Flex>
        </Flex>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const ScrollingBody: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Long-content sheet — the body scrolls while header + footer " +
          "stay pinned. Useful for change-log panels or long forms.",
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Release notes</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>v3.0.0 — release notes</SheetTitle>
          <SheetDescription>2026-05-16</SheetDescription>
        </SheetHeader>
        <div
          style={{
            padding: "var(--spacing-3)",
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ marginBottom: "var(--spacing-2)" }}>
              §{i + 1}. Sandbox provisioning step {i + 1} now propagates the
              Vault-backed tmpfs to <code>/run/godx-secrets/$USER</code>
              before the netns provider mounts.
            </p>
          ))}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Uncontrolled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default uncontrolled — open state lives inside Radix. Use " +
          "`defaultOpen` to start opened on mount.",
      },
    },
  },
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button>Reopen</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Uncontrolled sheet</SheetTitle>
          <SheetDescription>
            Open state managed by Radix internally. <code>defaultOpen</code>
            starts the panel visible.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Lift `open` to the parent so external events (route change, " +
          "mutation, server push) can drive the sheet.",
      },
    },
  },
  render: function ControlledRender() {
    const [open, setOpen] = useState(false);
    return (
      <Flex vertical gap="middle" align="start">
        <Flex gap="small">
          <Button onClick={() => setOpen(true)}>
            <SlidersHorizontal size={14} /> Open
          </Button>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={!open}
          >
            Close
          </Button>
        </Flex>
        <span style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}>
          External state: <code>{String(open)}</code>
        </span>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Controlled sheet</SheetTitle>
              <SheetDescription>
                Open state lives in the parent via <code>useState</code>.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button onClick={() => setOpen(false)}>Dismiss</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Flex>
    );
  },
};
