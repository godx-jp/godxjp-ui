import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/primitives";
import { ProductSwitcher } from "../../components/shell";
import { PRODUCTS } from "../examples/products";

/**
 * Shell/ProductSwitcher — Radix Popover with searchable product list.
 *
 * Per cardinal rule 29 the trigger is a framework Button — never a
 * raw <button>.
 */

const meta: Meta<typeof ProductSwitcher> = {
  title: "Shell/ProductSwitcher",
  component: ProductSwitcher,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Quick-switcher dropdown for the active product/org. " +
          "Filters by name + role; ✓ marker on the active row.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProductSwitcher>;

export const Default: Story = {
  render: () => {
    const [activeId, setActiveId] = useState(PRODUCTS[0].id);
    const [open, setOpen] = useState(true);
    return (
      <ProductSwitcher
        trigger={
          <Button variant="outline" endContent={<ChevronDown size={14} />}>
            Switch product
          </Button>
        }
        activeId={activeId}
        products={PRODUCTS}
        onSelect={(p) => {
          setActiveId(p.id);
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
      />
    );
  },
};

export const WithSelected: Story = {
  name: "With selected (godx-admin)",
  render: () => {
    const [activeId, setActiveId] = useState(PRODUCTS[1].id);
    const [open, setOpen] = useState(true);
    return (
      <ProductSwitcher
        trigger={
          <Button variant="outline" endContent={<ChevronDown size={14} />}>
            {PRODUCTS.find((p) => p.id === activeId)?.name ?? "Switch product"}
          </Button>
        }
        activeId={activeId}
        products={PRODUCTS}
        onSelect={(p) => {
          setActiveId(p.id);
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
      />
    );
  },
};

export const Empty: Story = {
  name: "Empty (products=[])",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <ProductSwitcher
        trigger={
          <Button variant="outline" endContent={<ChevronDown size={14} />}>
            No products
          </Button>
        }
        activeId=""
        products={[]}
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
    );
  },
};
