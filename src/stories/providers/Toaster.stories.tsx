import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, toast } from "../../components/feedback/toaster";
import { Button } from "../../components/general/Button";
import { Card, CardHeader, CardBody } from "../../components/data-display/Card";
import { Typography } from "../../components/primitives";

/**
 * Providers/Toaster — root-mount component for the `toast()` API.
 *
 * `<Toaster />` is NOT a React context provider, but it operates the
 * same way as one: mount it once near the root, then anywhere else
 * in the tree call `toast.success(...)` / `toast.error(...)` / etc.
 * and the message renders into the portal this component owns.
 *
 * Wraps `sonner` (cardinal rule 14 — shadcn-canonical toast library).
 * For per-toast styling + the full surface of toast actions, see
 * the `Feedback/Toaster` group.
 */

const meta: Meta = {
  title: "Providers/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**\`<Toaster />\`** is the singleton portal target for the \`toast()\`
API. Mount it once near the root of your tree — anywhere in the app
can then trigger a toast:

\`\`\`tsx
import { Toaster, toast } from "@godxjp/ui"

// In your root tree
<>
  <App />
  <Toaster position="top-right" />
</>

// Anywhere in App
toast.success("保存しました")
toast.error("接続に失敗しました")
\`\`\`

Required ONLY when the app actually calls \`toast()\`. Place it AFTER
\`<GodxConfigProvider>\` so the toast surface inherits locale + theme
tokens.

For visual variants (status colours, promise, action button, custom
JSX content) browse the **Feedback/Toaster** stories — those show
the full \`toast()\` surface, while this group covers the root
mounting contract.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  name: "Default — mount once, fire toasts",
  render: function Default() {
    return (
      <Card padding="cozy">
        <CardHeader>
          <Typography.Title size={4} style={{ margin: 0 }}>
            Click to emit a toast
          </Typography.Title>
          <Typography.Text color="secondary">
            The toast renders into the single `<Toaster />` mounted below.
          </Typography.Text>
        </CardHeader>
        <CardBody>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button onClick={() => toast("プレーン通知")}>plain</Button>
            <Button variant="primary" onClick={() => toast.success("保存しました")}>
              success
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error("接続に失敗しました")}
            >
              error
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.info("読み込み中…")}
            >
              info
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                toast("元に戻せます", {
                  action: { label: "Undo", onClick: () => toast("Undone") },
                })
              }
            >
              with action
            </Button>
          </div>
        </CardBody>
        <Toaster />
      </Card>
    );
  },
};

export const Positions: Story = {
  name: "Positions — top-right / top-center / bottom-right …",
  parameters: {
    docs: {
      description: {
        story:
          "Set the `position` prop on `<Toaster />` to control where toasts stack. Only one `<Toaster />` is mounted per app; choose the position that matches your product's notification convention.",
      },
    },
  },
  render: function Positions() {
    return (
      <Card padding="cozy">
        <CardHeader>
          <Typography.Title size={4} style={{ margin: 0 }}>
            position="bottom-right"
          </Typography.Title>
        </CardHeader>
        <CardBody>
          <Button onClick={() => toast.success("bottom-right stack")}>
            fire toast
          </Button>
        </CardBody>
        <Toaster position="bottom-right" />
      </Card>
    );
  },
};
