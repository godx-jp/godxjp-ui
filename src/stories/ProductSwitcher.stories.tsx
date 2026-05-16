import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ProductSwitcher } from "../components/shell/ProductSwitcher";
import { Button } from "../components/primitives/Button";
import { PRODUCTS, type ForgeProduct } from "../data/products";

const meta: Meta<typeof ProductSwitcher> = {
  title: "Shell/ProductSwitcher",
  component: ProductSwitcher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
\`ProductSwitcher\` wraps a trigger (typically the product chip in the
\`Topbar\`) with a Radix \`Popover\` listing every product the user can
see.

### Props

- \`trigger\` — any node; spread as \`asChild\` into Radix's Trigger.
- \`activeId\` — current product id; renders a ✓ marker.
- \`products\` — list of \`ForgeProduct\`; defaults to the shared
  \`PRODUCTS\` fixture in \`@godxjp/ui/data\`.
- \`onSelect(product)\` — fires on click.
- \`open\` / \`onOpenChange\` — optional controlled-open API.

### Behaviour

- Search input filters by \`name\` + \`role\` (case-insensitive substring).
- Each row shows brand mark, name, role subtext, project count, and
  dev count.
- Active row gets a ✓ + visual highlight.
- Per MUST RULE #12 this is the **only** product switcher in the
  system.
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProductSwitcher>;

// Default trigger — looks like the topbar product chip.
function DefaultTrigger({ product }: { product: ForgeProduct }) {
  return (
    <button className="tb-chip" type="button" aria-label={product.name}>
      <span className="tb-chip-icon" style={{ background: product.color }}>
        {product.name[0]?.toUpperCase() ?? "?"}
      </span>
      <span className="tb-chip-label">{product.name}</span>
      <span className="tb-chip-caret">
        <ChevronDown size={12} />
      </span>
    </button>
  );
}

export const Closed: Story = {
  name: "Closed (default — click to open)",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProductSwitcher
        trigger={<DefaultTrigger product={PRODUCTS[0]} />}
        activeId={PRODUCTS[0].id}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const Open: Story = {
  name: "Open (all products)",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProductSwitcher
        open
        onOpenChange={() => {}}
        trigger={<DefaultTrigger product={PRODUCTS[0]} />}
        activeId={PRODUCTS[0].id}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const OpenSecondActive: Story = {
  name: "Open · second product active",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProductSwitcher
        open
        onOpenChange={() => {}}
        trigger={<DefaultTrigger product={PRODUCTS[1]} />}
        activeId={PRODUCTS[1].id}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const OpenSubsetOnly: Story = {
  name: "Open · custom subset of products",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProductSwitcher
        open
        onOpenChange={() => {}}
        trigger={<DefaultTrigger product={PRODUCTS[0]} />}
        activeId={PRODUCTS[0].id}
        products={PRODUCTS.slice(0, 2)}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const OpenEmpty: Story = {
  name: "Open · empty list",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProductSwitcher
        open
        onOpenChange={() => {}}
        trigger={<DefaultTrigger product={PRODUCTS[0]} />}
        activeId="none"
        products={[]}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const CustomTrigger: Story = {
  name: "Custom trigger node",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProductSwitcher
        trigger={<Button variant="secondary">Switch product</Button>}
        activeId={PRODUCTS[0].id}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const Playground: Story = {
  name: "Playground · controlled with selection",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      const [activeId, setActiveId] = useState(PRODUCTS[0].id);
      const active = PRODUCTS.find((p) => p.id === activeId) ?? PRODUCTS[0];
      return (
        <div style={{ padding: 16 }}>
          <ProductSwitcher
            open={open}
            onOpenChange={setOpen}
            trigger={<DefaultTrigger product={active} />}
            activeId={activeId}
            onSelect={(p) => {
              setActiveId(p.id);
              setOpen(false);
            }}
          />
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)" }}>
            Active: <code>{active.name}</code> ({active.tenant})
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};
