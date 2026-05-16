import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TweaksPanel } from "../components/shell/TweaksPanel";
import { Button } from "../components/primitives/Button";

const meta: Meta<typeof TweaksPanel> = {
  title: "Shell/TweaksPanel",
  component: TweaksPanel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
\`TweaksPanel\` is the right-side drawer that exposes the four toggles
every GoDX surface must honour: **density · theme · tenant · locale ·
sidebar collapsed**.

### State plumbing

Owned state lives in the \`useTweaks\` hook (\`@godxjp/ui/hooks\`),
localStorage-persisted under key \`godx.tweaks\`. The hook mirrors each
value onto \`<html data-*>\` attributes so design tokens scoped to
\`[data-tenant=…]\`, \`[data-theme=…]\`, \`[data-density=…]\` pick up the
change in pure CSS — no React re-render required for the design layer.

### Props

- \`open\` — drawer visibility.
- \`onOpenChange\` — visibility change callback.

The component is **stateless**: every control reads + writes through
\`useTweaks\`. This is why services don't pass values in: the hook is
the single source of truth.

### Composition rule

Per MUST RULE #5 + #8 no service ships its own theme/density/locale
switcher. Every consumer mounts this drawer and wires the
\`onTweaksOpen\` callback from \`Topbar\` to flip \`open\`.

### Storybook globals

If the project's preview wires the Storybook toolbar globals for
theme/locale/tenant, those flip the same \`<html data-*>\` attributes,
so the controls inside this drawer stay in sync visually.
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TweaksPanel>;

export const Closed: Story = {
  name: "Closed (default)",
  render: () => (
    <div style={{ padding: 24, fontSize: 13, color: "var(--muted-foreground)" }}>
      Drawer is closed. See the Open story for the rendered panel.
      <TweaksPanel open={false} onOpenChange={() => {}} />
    </div>
  ),
};

export const Open: Story = {
  name: "Open · all sections",
  render: () => <TweaksPanel open onOpenChange={() => {}} />,
};

export const TriggerByButton: Story = {
  name: "Controlled via button",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ padding: 24 }}>
          <Button onClick={() => setOpen(true)}>Open tweaks</Button>
          <TweaksPanel open={open} onOpenChange={setOpen} />
        </div>
      );
    }
    return <Demo />;
  },
};

export const Playground: Story = {
  name: "Playground · open by default",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      return (
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Flip controls inside the drawer; check <code>document.documentElement.dataset</code>
            to see the tokens update on <code>&lt;html&gt;</code>.
          </p>
          <Button variant="secondary" onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Open"}
          </Button>
          <TweaksPanel open={open} onOpenChange={setOpen} />
        </div>
      );
    }
    return <Demo />;
  },
};
