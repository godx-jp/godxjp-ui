import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AlertTriangle, Info, ShieldAlert, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/primitives/AlertDialog";
import { Button } from "../components/primitives/Button";
import { Flex } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/AlertDialog",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**AlertDialog** — high-friction confirmation modal wrapping
[\`@radix-ui/react-alert-dialog\`](https://www.radix-ui.com/primitives/docs/components/alert-dialog).
Use for destructive or otherwise non-reversible actions where the
operator MUST acknowledge before continuing.

Differs from \`Dialog\` in two ways:

1. **Modality is stricter** — clicking the overlay does NOT close
   the dialog; the operator must press a button.
2. **Two-button affordance** — \`AlertDialogAction\` (primary,
   typically confirms) and \`AlertDialogCancel\` (secondary,
   typically cancels) are first-class primitives and inherit
   \`.btn-primary\` / \`.btn-secondary\` token styles automatically.

### Keyboard navigation

- **Esc** — closes (treated as cancel).
- **Tab** / **Shift+Tab** — cycles between Action and Cancel; focus
  trapped inside the dialog while open.
- **Enter** — activates the focused button.
- Initial focus lands on the Cancel button by default to make
  destructive actions an explicit two-step gesture.

### Accessibility (WCAG 2.1 AA)

- Radix injects \`role="alertdialog"\`, \`aria-modal="true"\`, and
  ties Title + Description via \`aria-labelledby\` /
  \`aria-describedby\`.
- Outside content is \`aria-hidden\` and body scroll is locked.
- The cancel-by-default focus order means accidental Enter cannot
  trigger a destructive action.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="danger">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const DeleteProject: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Realistic destructive flow — names the target, quantifies the " +
          "blast radius, uses a destructive label for the action button.",
      },
    },
  },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="danger">
          <Trash2 size={14} /> Delete project
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Flex align="center" gap="small">
              <AlertTriangle size={18} aria-hidden /> Delete project "godx-admin"?
            </Flex>
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove 47 sandboxes, 312 worktrees, and
            the project's bare mirror at <code>/srv/projectgit/</code>.
            Data cannot be recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="btn btn-danger">
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const RevokeAccess: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Mid-severity destructive — revoking a session is reversible by " +
          "re-inviting, so the action stays primary-styled but the copy " +
          "names the consequence.",
      },
    },
  },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="danger">Revoke session</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Flex align="center" gap="small">
              <ShieldAlert size={18} aria-hidden /> Revoke access for satoshi@famgia.com?
            </Flex>
          </AlertDialogTitle>
          <AlertDialogDescription>
            All 3 active sandbox sessions terminate within 30 seconds. The
            user can re-authenticate after you grant access again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep access</AlertDialogCancel>
          <AlertDialogAction>Revoke session</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const InfoOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Single-button acknowledgement variant. Hide the cancel button " +
          "when there is no opt-out (e.g. policy banner the operator must " +
          "read once).",
      },
    },
  },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary">Read banner</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Flex align="center" gap="small">
              <Info size={18} aria-hidden /> Maintenance window 03:00–05:00 JST
            </Flex>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sandboxes will rotate to the new Postgres primary during the
            window. Existing sessions stay live; new connections may pause
            for ~30 seconds at cut-over.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Acknowledge</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const CustomActionLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Action / Cancel labels accept arbitrary copy. Avoid generic " +
          "OK / Cancel — name the verb the operator is committing to.",
      },
    },
  },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Discard draft</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have 14 minutes of unsaved edits to{" "}
            <code>docs/runbooks/login-flow-standard.md</code>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction>Discard changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Uncontrolled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Radix-managed open state; the consumer wires trigger + action. " +
          "Use this shape for 90% of cases.",
      },
    },
  },
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="danger">Open uncontrolled</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm operation</AlertDialogTitle>
          <AlertDialogDescription>
            Radix manages open / close internally based on trigger and
            action presses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Lift open state to the parent so confirmation can be driven by " +
          "an async mutation (e.g. show the dialog only after a fetch " +
          "verifies the target exists). Close after the action settles.",
      },
    },
  },
  render: function ControlledRender() {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    return (
      <Flex vertical gap="middle" align="start">
        <Button variant="danger" onClick={() => setOpen(true)}>
          <Trash2 size={14} /> Trigger delete flow
        </Button>
        <span style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}>
          External state: <code>{String(open)}</code> / busy:{" "}
          <code>{String(busy)}</code>
        </span>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Open state is controlled. The Confirm button simulates an
                async delete (1s) before closing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={busy}
                onClick={(event) => {
                  event.preventDefault();
                  setBusy(true);
                  setTimeout(() => {
                    setBusy(false);
                    setOpen(false);
                  }, 1000);
                }}
              >
                {busy ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Flex>
    );
  },
};
