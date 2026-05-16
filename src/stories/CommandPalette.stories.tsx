import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CommandPalette } from "../components/shell/CommandPalette";
import { Button } from "../components/primitives/Button";
import type { CommandItem } from "../components/shell/CommandPalette";

const meta: Meta<typeof CommandPalette> = {
  title: "Shell/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
\`CommandPalette\` is the \`⌘K\` shortcut every GoDX service mounts at the
shell root. Built on \`@radix-ui/react-dialog\` + \`cmdk\`, it provides:

- Centered overlay dialog (token-styled chrome).
- Keyboard-driven cmdk list — \`↑↓\` navigate, \`⏎\` select, \`esc\` close.
- Group headers when items declare a \`group\`.
- Empty state when search returns nothing.
- Global \`⌘K\` / \`Ctrl+K\` listener that toggles \`open\`.

### Props

- \`open\` / \`onOpenChange\` — controlled state. Always wire both.
- \`commands\` — flat \`CommandItem[]\`; each has \`id\`, \`label\`, optional
  \`group\`, optional \`hint\`, and a required \`onSelect\` handler. Items
  are grouped by \`group\` in render order.

### Composition rule

Per MUST RULE #11 services do **not** ship their own \`⌘K\` dialogs.
Build the command list, hand it to this component, and you inherit the
keyboard nav + visuals.
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof CommandPalette>;

const ACTION_COMMANDS: CommandItem[] = [
  { id: "new-issue", label: "New issue", group: "Actions", hint: "n i", onSelect: () => {} },
  { id: "new-pr", label: "Open pull request", group: "Actions", hint: "n p", onSelect: () => {} },
  { id: "new-doc", label: "New document", group: "Actions", onSelect: () => {} },
];

const NAV_COMMANDS: CommandItem[] = [
  { id: "go-home", label: "Go to Home", group: "Navigation", hint: "g h", onSelect: () => {} },
  { id: "go-projects", label: "Go to Projects", group: "Navigation", hint: "g p", onSelect: () => {} },
  { id: "go-people", label: "Go to People", group: "Navigation", hint: "g e", onSelect: () => {} },
  { id: "go-settings", label: "Go to Settings", group: "Navigation", hint: "g s", onSelect: () => {} },
];

const HELP_COMMANDS: CommandItem[] = [
  { id: "docs", label: "Open docs", group: "Help", onSelect: () => {} },
  { id: "feedback", label: "Send feedback", group: "Help", onSelect: () => {} },
];

export const ClosedDefault: Story = {
  name: "Closed (press ⌘K to open)",
  render: () => (
    <div style={{ padding: 24, fontSize: 13, color: "var(--muted-foreground)" }}>
      Press <kbd className="kbd">⌘K</kbd> or <kbd className="kbd">Ctrl+K</kbd> to open the palette.
      <CommandPalette open={false} onOpenChange={() => {}} commands={ACTION_COMMANDS} />
    </div>
  ),
};

export const OpenDefault: Story = {
  name: "Open · default commands",
  render: () => (
    <CommandPalette
      open
      onOpenChange={() => {}}
      commands={ACTION_COMMANDS}
    />
  ),
};

export const OpenWithGroups: Story = {
  name: "Open · grouped (Actions / Navigation / Help)",
  render: () => (
    <CommandPalette
      open
      onOpenChange={() => {}}
      commands={[...ACTION_COMMANDS, ...NAV_COMMANDS, ...HELP_COMMANDS]}
    />
  ),
};

export const OpenEmpty: Story = {
  name: "Open · no commands (empty state)",
  render: () => (
    <CommandPalette open onOpenChange={() => {}} commands={[]} />
  ),
};

export const OpenSingleGroup: Story = {
  name: "Open · single group (no heading)",
  render: () => (
    <CommandPalette
      open
      onOpenChange={() => {}}
      commands={[
        { id: "1", label: "Open issue #128", onSelect: () => {} },
        { id: "2", label: "Open issue #131", onSelect: () => {} },
        { id: "3", label: "Open issue #144", onSelect: () => {} },
      ]}
    />
  ),
};

export const ControlledViaButton: Story = {
  name: "Controlled · trigger via button",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      const [lastPicked, setLastPicked] = useState<string>("none");
      return (
        <div style={{ padding: 24 }}>
          <Button onClick={() => setOpen(true)}>Open command palette</Button>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)" }}>
            Last picked: <code>{lastPicked}</code>
          </div>
          <CommandPalette
            open={open}
            onOpenChange={setOpen}
            commands={[
              { id: "a", label: "Action A", group: "Actions", onSelect: () => setLastPicked("Action A") },
              { id: "b", label: "Action B", group: "Actions", onSelect: () => setLastPicked("Action B") },
              { id: "c", label: "Action C", group: "Actions", onSelect: () => setLastPicked("Action C") },
            ]}
          />
        </div>
      );
    }
    return <Demo />;
  },
};

export const LongList: Story = {
  name: "Open · long list (scrolls)",
  render: () => (
    <CommandPalette
      open
      onOpenChange={() => {}}
      commands={Array.from({ length: 40 }, (_, i) => ({
        id: `cmd-${i}`,
        label: `Command ${i + 1}`,
        group: i < 20 ? "Frequent" : "Recent",
        hint: i < 9 ? `${i + 1}` : undefined,
        onSelect: () => {},
      }))}
    />
  ),
};

export const Playground: Story = {
  name: "Playground",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          commands={[...ACTION_COMMANDS, ...NAV_COMMANDS, ...HELP_COMMANDS]}
        />
      );
    }
    return <Demo />;
  },
};
