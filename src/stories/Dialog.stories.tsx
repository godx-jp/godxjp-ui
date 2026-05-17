import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AlertTriangle, Pencil, Settings2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/primitives/Dialog";
import { Button } from "../components/primitives/Button";
import { Input, Textarea } from "../components/primitives/Input";
import { Label } from "../components/primitives/Label";
import { Flex } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/Dialog",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Dialog** — modal surface wrapping
[\`@radix-ui/react-dialog\`](https://www.radix-ui.com/primitives/docs/components/dialog).
Use for confirmations, focused edits, and one-task forms that should
block surrounding navigation until resolved.

The primitive composes from \`Dialog\`, \`DialogTrigger\`,
\`DialogContent\`, \`DialogHeader\`, \`DialogTitle\`,
\`DialogDescription\`, \`DialogFooter\`, and \`DialogClose\`.
\`DialogPortal\` is exported for advanced portal-root overrides.

### Keyboard navigation

- **Esc** — closes the dialog (cancel-equivalent).
- **Tab** / **Shift+Tab** — cycles focus inside the focus trap; focus
  never escapes the content while open.
- **Enter** — submits the primary action when a button has keyboard
  focus.
- Focus returns to the trigger element on close.

### Accessibility (WCAG 2.1 AA)

- Radix injects \`role="dialog"\` + \`aria-modal="true"\` on
  \`DialogContent\`, and wires \`aria-labelledby\` /
  \`aria-describedby\` to \`DialogTitle\` / \`DialogDescription\`.
- Background content receives \`aria-hidden="true"\` while open.
- Focus is trapped, scroll on the body is locked.
- Visible focus rings use the token-driven \`.btn:focus-visible\`
  outline so the 4.5:1 contrast contract is preserved on both themes.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>
            This will permanently update your profile. Continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const SimpleConfirm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Publish release</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish v3.0.0?</DialogTitle>
          <DialogDescription>
            Tagged release will roll out to all 47 sandboxes within the next
            10 minutes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Publish</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FormInDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Pencil size={14} /> Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロフィールを編集</DialogTitle>
          <DialogDescription>
            Display name, handle, and bio are visible to every workspace
            member.
          </DialogDescription>
        </DialogHeader>
        <Flex vertical gap="middle" style={{ padding: "var(--spacing-3) 0" }}>
          <Flex vertical gap="small">
            <Label htmlFor="profile-name">Display name</Label>
            <Input id="profile-name" defaultValue="Satoshi" />
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="profile-handle">Handle</Label>
            <Input id="profile-handle" defaultValue="@satoshi" />
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              defaultValue="Building godx-admin from /home/satoshi."
              rows={3}
            />
          </Flex>
        </Flex>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ScrollingBody: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Terms of service</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acceptable use policy</DialogTitle>
          <DialogDescription>
            Last revised 2026-05-13. Scroll to read the full document.
          </DialogDescription>
        </DialogHeader>
        <div style={{ maxHeight: 280, overflowY: "auto", padding: "var(--spacing-2) 0" }}>
          {Array.from({ length: 16 }, (_, i) => (
            <p key={i} style={{ marginBottom: "var(--spacing-2)" }}>
              §{i + 1}. The operator may revoke sandbox access at any time
              if usage violates the platform's resource quota or audit
              policy. Revocation triggers a 30-second graceful-shutdown
              window before the netns is destroyed.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DestructiveAction: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">
          <Trash2 size={14} /> Remove sandbox
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Flex align="center" gap="small">
              <AlertTriangle size={18} aria-hidden /> Remove sandbox "feat-ui"?
            </Flex>
          </DialogTitle>
          <DialogDescription>
            This destroys the netns and 12 GB of unsynced worktree files.
            The action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Keep sandbox</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="danger">Remove permanently</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Uncontrolled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default uncontrolled mode — Radix manages open state internally. " +
          "Pass `defaultOpen` to start opened.",
      },
    },
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="secondary">Reopen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>
            This dialog opens on mount via <code>defaultOpen</code>. After
            close it stays closed until the trigger is pressed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Got it</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Open state lifted to the parent — drive open from any side " +
          "(URL param, mutation success, server event). The trigger is " +
          "purely cosmetic; programmatic `setOpen(true)` is the source of truth.",
      },
    },
  },
  render: function ControlledRender() {
    const [open, setOpen] = useState(false);
    return (
      <Flex vertical gap="middle" align="start">
        <Flex gap="small" wrap>
          <Button onClick={() => setOpen(true)}>
            <Settings2 size={14} /> Open externally
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={!open}>
            Close externally
          </Button>
        </Flex>
        <span style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}>
          External state: <code>{String(open)}</code>
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled dialog</DialogTitle>
              <DialogDescription>
                Open state lives in the parent via <code>useState</code>.
                Closing via Esc or the overlay still calls
                <code> onOpenChange(false)</code>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Dismiss
              </Button>
              <Button onClick={() => setOpen(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Flex>
    );
  },
};

export const EditProfileComposition: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Real-world composition: header + scrolling form body + footer " +
          "with destructive (Delete account) + neutral (Cancel) + primary " +
          "(Save) actions. Mirrors the shape used by `me-service`.",
      },
    },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Pencil size={14} /> Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Changes apply across every godx surface (sandbox, forge, chat).
          </DialogDescription>
        </DialogHeader>
        <Flex vertical gap="middle" style={{ padding: "var(--spacing-3) 0" }}>
          <Flex gap="middle" wrap>
            <Flex vertical gap="small" flex={1}>
              <Label htmlFor="first">First name</Label>
              <Input id="first" defaultValue="Satoshi" />
            </Flex>
            <Flex vertical gap="small" flex={1}>
              <Label htmlFor="last">Last name</Label>
              <Input id="last" defaultValue="Nakamoto" />
            </Flex>
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="satoshi@famgia.com" />
          </Flex>
          <Flex vertical gap="small">
            <Label htmlFor="bio2">Bio</Label>
            <Textarea
              id="bio2"
              rows={4}
              defaultValue="Platform engineer. Focuses on multi-deployment infra."
            />
          </Flex>
        </Flex>
        <DialogFooter>
          <Flex justify="space-between" align="center" flex={1}>
            <Button variant="danger">
              <Trash2 size={14} /> Delete account
            </Button>
            <Flex gap="small">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Save changes</Button>
              </DialogClose>
            </Flex>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
