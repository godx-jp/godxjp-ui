import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  GitBranch,
  LogOut,
  MoreVertical,
  Pencil,
  Settings,
  Share2,
  Trash2,
  User,
} from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "../components/primitives/DropdownMenu";
import { Button } from "../components/primitives/Button";
import { Avatar } from "../components/primitives/Avatar";
import { Flex } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/DropdownMenu",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**DropdownMenu** — action menu anchored to a trigger, wrapping
[\`@radix-ui/react-dropdown-menu\`](https://www.radix-ui.com/primitives/docs/components/dropdown-menu).
Use for kebab / caret / button-driven action lists where each row
performs a discrete action and selection dismisses the menu.

The primitive exports the parts the design system has token coverage
for: \`DropdownMenu\`, \`DropdownMenuTrigger\`,
\`DropdownMenuContent\`, \`DropdownMenuItem\`,
\`DropdownMenuLabel\`, \`DropdownMenuSeparator\`,
\`DropdownMenuShortcut\`, \`DropdownMenuGroup\`,
\`DropdownMenuPortal\`, \`DropdownMenuSub\`, and
\`DropdownMenuRadioGroup\`. Sub-menu triggers / contents and
checkbox / radio item visuals are intentionally NOT wrapped — drop to
\`@radix-ui/react-dropdown-menu\` directly when you need them and add
the tokens before re-exporting.

\`DropdownMenuItem\` supports \`variant="destructive"\` for dangerous
rows and \`inset\` for left-padding alignment when icons aren't on
every row.

### Keyboard navigation

- **Space** / **Enter** / **ArrowDown** on the trigger — opens the menu.
- **ArrowUp** / **ArrowDown** — moves focus between items (typeahead
  also supported by first character).
- **Enter** / **Space** — activates the focused item and closes.
- **Esc** — closes; focus returns to the trigger.
- **Tab** — closes the menu and moves focus to the next focusable
  element.

### Accessibility (WCAG 2.1 AA)

- Radix wires \`role="menu"\` on Content and \`role="menuitem"\` on
  every Item, with \`aria-expanded\` / \`aria-controls\` on the trigger.
- Disabled items get \`aria-disabled\` and skip focus order.
- The destructive variant uses the token \`--destructive\` color
  meeting 4.5:1 contrast on the menu surface.
- \`sideOffset\` defaults to 6 px so the menu doesn't collide with the
  trigger's focus ring.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          Actions <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Share</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const SimpleActionMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Minimal kebab-driven action menu — common on table rows + " +
          "card headers.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Row actions">
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Pencil size={14} aria-hidden /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy size={14} aria-hidden /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <Trash2 size={14} aria-hidden /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithSeparatorAndLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Grouped items using `DropdownMenuLabel` (non-interactive " +
          "heading) and `DropdownMenuSeparator` (visual divider).",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          Project <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Project</DropdownMenuLabel>
        <DropdownMenuItem>Open in VSCode</DropdownMenuItem>
        <DropdownMenuItem>View in forge</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Worktree</DropdownMenuLabel>
        <DropdownMenuItem>Sync from upstream</DropdownMenuItem>
        <DropdownMenuItem>Reset to HEAD</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete worktree</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithShortcuts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`DropdownMenuShortcut` renders a right-aligned hotkey label. " +
          "The shortcut is documentation — wire the actual keybinding " +
          "in your global handler.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          File <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          New worktree
          <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Open recent
          <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Save
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Quit
          <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithGroups: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`DropdownMenuGroup` semantically groups related items for " +
          "assistive tech (Radix exposes them as a `role=\"group\"`).",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          Edit <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>History</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Undo
            <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Redo
            <DropdownMenuShortcut>⇧⌘Z</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Clipboard</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Cut
            <DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Paste
            <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithSubMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`DropdownMenuSub` is exported, but `SubTrigger` / `SubContent` " +
          "are intentionally NOT wrapped yet (no token coverage in " +
          "`tokens.css`). The story below drops to " +
          "`@radix-ui/react-dropdown-menu` directly for those parts — " +
          "this is the documented escape-hatch until tokens land.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          More <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuPrimitive.SubTrigger className="dropdown-menu-item">
            <GitBranch size={14} aria-hidden /> Switch branch
            <span style={{ marginLeft: "auto", display: "inline-flex" }}>
              <ChevronRight size={14} />
            </span>
          </DropdownMenuPrimitive.SubTrigger>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.SubContent
              className="dropdown-menu-content"
              sideOffset={4}
            >
              <DropdownMenuItem>main</DropdownMenuItem>
              <DropdownMenuItem>dev</DropdownMenuItem>
              <DropdownMenuItem>feat/forge-shell-align</DropdownMenuItem>
              <DropdownMenuItem>fix/sandbox-bootstrap</DropdownMenuItem>
            </DropdownMenuPrimitive.SubContent>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const UserMenuPattern: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Top-right user menu — header row with avatar + email, then " +
          "account / settings / sign-out actions.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Avatar size="sm" variant="brand">S</Avatar> satoshi@famgia.com{" "}
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
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
              satoshi@famgia.com
            </span>
          </Flex>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User size={14} aria-hidden /> Profile
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings size={14} aria-hidden /> Preferences
          <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut size={14} aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ProjectContextMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Project-row kebab menu — open, share, copy URL, then " +
          "destructive delete separated below.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Project actions">
          <MoreVertical size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>godx-admin</DropdownMenuLabel>
        <DropdownMenuItem>
          <ExternalLink size={14} aria-hidden /> Open in forge
          <DropdownMenuShortcut>↵</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 size={14} aria-hidden /> Share workspace
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy size={14} aria-hidden /> Copy clone URL
          <DropdownMenuShortcut>⌘L</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <GitBranch size={14} aria-hidden /> Switch branch
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 size={14} aria-hidden /> Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const DisabledItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Disabled items are still rendered (preserve menu shape) but " +
          "skip focus and emit `aria-disabled`.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          Actions <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem disabled>Share (read-only)</DropdownMenuItem>
        <DropdownMenuItem disabled>Export (no rows)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Uncontrolled: Story = {
  parameters: {
    docs: {
      description: {
        story: "Radix manages open / close internally. The common case.",
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          Uncontrolled <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>One</DropdownMenuItem>
        <DropdownMenuItem>Two</DropdownMenuItem>
        <DropdownMenuItem>Three</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Lift open state to the parent — useful when a keyboard shortcut " +
          "or external event needs to open the menu programmatically.",
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
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              Anchored trigger <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setOpen(false)}>
              One
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpen(false)}>
              Two
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpen(false)}>
              Three
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Flex>
    );
  },
};
