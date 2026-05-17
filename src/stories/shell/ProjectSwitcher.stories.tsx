import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/primitives";
import { ProjectSwitcher } from "../../components/shell";
import type { RecentProject } from "../../components/shell";
import { PRODUCTS } from "../examples/products";

/**
 * Shell/ProjectSwitcher — Linear-style cross-product project picker.
 *
 * Per cardinal rule 29 the trigger uses the framework Button — never
 * raw HTML buttons or inline-styled chips.
 */

const meta: Meta<typeof ProjectSwitcher> = {
  title: "Shell/ProjectSwitcher",
  component: ProjectSwitcher,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cross-product project picker. Search runs over every " +
          "product's projects, grouped by owning product. Optional " +
          "Recent surfaces last-N projects above the groups.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProjectSwitcher>;

const TRIGGER = (
  <Button variant="outline" endContent={<ChevronDown size={14} />}>
    Switch project
  </Button>
);

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [active, setActive] = useState({
      productId: PRODUCTS[1].id,
      projectId: PRODUCTS[1].projects[0].id,
    });
    return (
      <ProjectSwitcher
        trigger={TRIGGER}
        activeProductId={active.productId}
        activeProjectId={active.projectId}
        products={PRODUCTS}
        onSelect={(pr, p) => {
          setActive({ productId: p.id, projectId: pr.id });
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
      />
    );
  },
};

export const WithRecents: Story = {
  name: "With recents",
  render: () => {
    const [open, setOpen] = useState(true);
    const [active, setActive] = useState({
      productId: PRODUCTS[1].id,
      projectId: PRODUCTS[1].projects[0].id,
    });
    const recent: RecentProject[] = [
      { productId: PRODUCTS[0].id, projectId: PRODUCTS[0].projects[0].id },
      { productId: PRODUCTS[1].id, projectId: PRODUCTS[1].projects[2].id },
      { productId: PRODUCTS[2].id, projectId: PRODUCTS[2].projects[0].id },
    ];
    return (
      <ProjectSwitcher
        trigger={TRIGGER}
        activeProductId={active.productId}
        activeProjectId={active.projectId}
        recent={recent}
        products={PRODUCTS}
        onSelect={(pr, p) => {
          setActive({ productId: p.id, projectId: pr.id });
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
      />
    );
  },
};

export const EmptyProducts: Story = {
  name: "Empty (products=[])",
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <ProjectSwitcher
        trigger={TRIGGER}
        products={[]}
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
    );
  },
};
