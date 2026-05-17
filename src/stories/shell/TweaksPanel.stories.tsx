import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../components/primitives";
import { TweaksPanel } from "../../components/shell";
import { PRODUCTS } from "../examples/products";

/**
 * Shell/TweaksPanel — right-side drawer exposing density / theme /
 * tenant / locale + sidebar-collapsed toggles.
 *
 * Per cardinal rule 29 the trigger is a framework Button — never a
 * raw HTML button.
 */

const meta: Meta<typeof TweaksPanel> = {
  title: "Shell/TweaksPanel",
  component: TweaksPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Right-side settings drawer. State persists via `useTweaks` " +
          "in localStorage. Pass `products=[]` to hide the tenant " +
          "selector.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TweaksPanel>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open tweaks
        </Button>
        <TweaksPanel
          open={open}
          onOpenChange={setOpen}
          products={PRODUCTS}
        />
      </>
    );
  },
};

export const NoTenantSelector: Story = {
  name: "No tenant selector (products=[])",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open tweaks
        </Button>
        <TweaksPanel open={open} onOpenChange={setOpen} products={[]} />
      </>
    );
  },
};
