import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, toast } from "../components/primitives/toaster";
import { Button } from "../components/primitives/Button";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/Toaster",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Toaster** — transient notification host wrapping
[\`sonner\`](https://sonner.emilkowal.ski/). Mount the \`<Toaster />\`
component **once** at the layout root; trigger notifications from
anywhere with the imported \`toast(...)\` helper.

The wrapper passes \`toastOptions.unstyled\` so every visual contract
comes from \`.toast*\` token classes in \`tokens.css\` — sonner's
default gray theme is overridden by design.

### Variants

- \`toast(msg)\` — default / informational
- \`toast.success(msg)\` — green chip, success token
- \`toast.error(msg)\` — destructive token
- \`toast.warning(msg)\` — warning token
- \`toast.info(msg)\` — info token
- \`toast.loading(msg)\` — spinner; replace with success / error on resolve
- \`toast.promise(promise, { loading, success, error })\` — auto-resolves

### Common options

- \`description\` — secondary line under the title
- \`action\` — single right-aligned button \`{ label, onClick }\`
- \`duration\` — ms; \`Infinity\` keeps it pinned until dismissed
- \`dismissible\` — defaults true; set false to force a programmatic dismiss
- \`id\` — assign + reuse to update an existing toast

### Toaster props (mount-once)

- \`position\` — \`top-left\` / \`top-center\` / \`top-right\` /
  \`bottom-left\` / \`bottom-center\` / \`bottom-right\`. Default
  \`bottom-right\`.
- \`expand\` — keep all visible toasts expanded rather than stacking
- \`richColors\` — sonner's richer per-variant palette (overlays
  token colors; leave off for the godx visual contract)

### Keyboard navigation

- **Esc** — dismisses the latest toast (with \`hotkey\` configurable).
- **Tab** — moves focus into the toast region; action buttons are
  reachable from keyboard.

### Accessibility (WCAG 2.1 AA)

- The host is announced as a live region (\`aria-live="polite"\` for
  default / info, \`assertive\` for error / warning per sonner's
  defaults).
- Action button text inherits 4.5:1 contrast against the toast surface.
- Respects \`prefers-reduced-motion\` for the slide-in animation.

### One toaster per app

Mounting \`<Toaster />\` more than once produces duplicate
notifications. Mount exactly one at the layout root.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <>
      <Button onClick={() => toast("Saved")}>Trigger default toast</Button>
      <Toaster />
    </>
  ),
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every built-in variant. The Toaster mounts once below the " +
          "trigger grid — the same host serves every kind.",
      },
    },
  },
  render: () => (
    <>
      <Space size="small" wrap>
        <Button onClick={() => toast("Default notification")}>Default</Button>
        <Button
          variant="secondary"
          onClick={() => toast.success("Profile saved")}
        >
          Success
        </Button>
        <Button
          variant="danger"
          onClick={() => toast.error("Sandbox provision failed")}
        >
          Error
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.warning("Quota at 92% — clean up soon")}
        >
          Warning
        </Button>
        <Button variant="secondary" onClick={() => toast.info("Build queued")}>
          Info
        </Button>
        <Button
          variant="ghost"
          onClick={() => toast.loading("Provisioning sandbox…")}
        >
          Loading
        </Button>
      </Space>
      <Toaster />
    </>
  ),
};

export const Success: Story = {
  render: () => (
    <>
      <Button onClick={() => toast.success("Worktree synced")}>Success</Button>
      <Toaster />
    </>
  ),
};

export const ErrorToast: Story = {
  name: "Error",
  render: () => (
    <>
      <Button
        variant="danger"
        onClick={() =>
          toast.error("Failed to clone repository", {
            description:
              "git ls-remote returned 403 — check the deploy key on godx-jp/godx-admin.",
          })
        }
      >
        Trigger error
      </Button>
      <Toaster />
    </>
  ),
};

export const Warning: Story = {
  render: () => (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          toast.warning("Disk usage at 92%", {
            description: "Run `docker system prune` to reclaim space.",
          })
        }
      >
        Trigger warning
      </Button>
      <Toaster />
    </>
  ),
};

export const Info: Story = {
  render: () => (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          toast.info("Maintenance window 03:00–05:00 JST", {
            description: "Postgres will rotate to the new primary at 03:30.",
          })
        }
      >
        Trigger info
      </Button>
      <Toaster />
    </>
  ),
};

export const WithDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`description` adds a secondary line — useful when the headline " +
          "needs supporting detail.",
      },
    },
  },
  render: () => (
    <>
      <Button
        onClick={() =>
          toast("Sandbox provisioned", {
            description:
              "feat-ui · ready at https://feat-ui.satoshi.local.godx.jp",
          })
        }
      >
        Toast with description
      </Button>
      <Toaster />
    </>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Right-aligned action button — single-action affordance for " +
          "undo / view / retry.",
      },
    },
  },
  render: () => (
    <>
      <Button
        onClick={() =>
          toast("Avatar uploaded", {
            description: "It may take a minute to propagate.",
            action: {
              label: "Undo",
              onClick: () => toast("Upload reverted"),
            },
          })
        }
      >
        Toast with action
      </Button>
      <Toaster />
    </>
  ),
};

export const PromiseStyle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`toast.promise` automatically swaps loading → success / error " +
          "as the promise settles. Wrap fetches and mutations directly.",
      },
    },
  },
  render: () => (
    <>
      <Space size="small" wrap>
        <Button
          onClick={() =>
            toast.promise(
              new Promise<{ name: string }>((resolve) =>
                setTimeout(() => resolve({ name: "feat-ui" }), 1500),
              ),
              {
                loading: "Cloning project…",
                success: (data) => `Cloned ${data.name}`,
                error: "Clone failed",
              },
            )
          }
        >
          Promise (resolves)
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            toast.promise(
              new Promise<void>((_resolve, reject) =>
                setTimeout(() => reject(new Error("403")), 1500),
              ),
              {
                loading: "Pushing to origin…",
                success: "Pushed",
                error: (err) => `Push failed: ${(err as Error).message}`,
              },
            )
          }
        >
          Promise (rejects)
        </Button>
      </Space>
      <Toaster />
    </>
  ),
};

export const CustomDuration: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`duration` in milliseconds. Pass `Infinity` to pin the toast " +
          "until programmatically dismissed.",
      },
    },
  },
  render: () => (
    <>
      <Space size="small" wrap>
        <Button onClick={() => toast("Quick (1s)", { duration: 1000 })}>
          1 second
        </Button>
        <Button
          onClick={() =>
            toast("Lingering (10s)", { duration: 10000 })
          }
        >
          10 seconds
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast("Pinned — dismiss manually", {
              duration: Infinity,
              action: {
                label: "Dismiss",
                onClick: () => {},
              },
            })
          }
        >
          Pinned (Infinity)
        </Button>
      </Space>
      <Toaster />
    </>
  ),
};

export const Dismissible: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default toasts are user-dismissible (close button on hover). " +
          "Set `dismissible: false` to require programmatic dismissal — " +
          "useful for in-flight operation toasts.",
      },
    },
  },
  render: () => (
    <>
      <Space size="small" wrap>
        <Button
          onClick={() =>
            toast("Click the × on hover to dismiss")
          }
        >
          Dismissible
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const id = toast.loading("Deploying release…", {
              dismissible: false,
            });
            setTimeout(() => toast.success("Released v3.0.0", { id }), 2000);
          }}
        >
          Not dismissible (auto-replaces)
        </Button>
      </Space>
      <Toaster />
    </>
  ),
};

export const PositionTopRight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`position` prop on the Toaster host pins the stack. Anchor " +
          "where it least obscures primary content for the surface.",
      },
    },
  },
  render: () => (
    <>
      <Button onClick={() => toast("Pinned top-right")}>Trigger</Button>
      <Toaster position="top-right" />
    </>
  ),
};

export const PositionTopCenter: Story = {
  render: () => (
    <>
      <Button onClick={() => toast("Pinned top-center")}>Trigger</Button>
      <Toaster position="top-center" />
    </>
  ),
};

export const PositionBottomLeft: Story = {
  render: () => (
    <>
      <Button onClick={() => toast("Pinned bottom-left")}>Trigger</Button>
      <Toaster position="bottom-left" />
    </>
  ),
};

export const PositionBottomCenter: Story = {
  render: () => (
    <>
      <Button onClick={() => toast("Pinned bottom-center")}>Trigger</Button>
      <Toaster position="bottom-center" />
    </>
  ),
};

export const LayoutRootComposition: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Real-world composition — the Toaster mounts once at the layout " +
          "root; many triggers across the page emit notifications. The " +
          "trigger grid uses `Flex` from the layout primitives (no inline " +
          "styles for visual spacing).",
      },
    },
  },
  render: () => (
    <Flex vertical gap="middle">
      <strong>Triggers</strong>
      <Flex gap="small" wrap>
        <Button onClick={() => toast("Worktree synced")}>Sync worktree</Button>
        <Button
          onClick={() => toast.success("Branch published to origin")}
          variant="secondary"
        >
          Publish branch
        </Button>
        <Button
          onClick={() => toast.error("Push rejected — non-fast-forward")}
          variant="danger"
        >
          Push (fails)
        </Button>
        <Button
          onClick={() => toast.warning("Stale lock detected on .git/index")}
          variant="secondary"
        >
          Lint
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            toast.info("Sandbox bridge IP rotated", {
              description: "Old: 10.42.0.1 → new: 10.42.0.5",
            })
          }
        >
          Inspect
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            toast("Release scheduled", {
              description: "v3.0.0 will deploy at 03:00 JST",
              action: { label: "View plan", onClick: () => {} },
            })
          }
        >
          Schedule
        </Button>
      </Flex>
      <Toaster />
    </Flex>
  ),
};
