import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ProjectSwitcher } from "../components/shell/ProjectSwitcher";
import { Button } from "../components/primitives/Button";
import { PRODUCTS, type ForgeProduct, type ForgeProject } from "../data/products";

const meta: Meta<typeof ProjectSwitcher> = {
  title: "Shell/ProjectSwitcher",
  component: ProjectSwitcher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
\`ProjectSwitcher\` is the cross-product project picker invoked from the
topbar's project chip. Linear-style: search across every product, group
results by their owning product, surface recents at the top.

### Props

- \`trigger\` — any node; rendered as the Radix popover trigger.
- \`activeProductId\` / \`activeProjectId\` — drive the ✓ marker.
- \`recent\` — \`RecentProject[]\` (\`{ productId, projectId }\`); top 3
  appear under a "Recent" header when the search query is empty.
- \`products\` — defaults to \`PRODUCTS\`.
- \`onSelect(project, product)\` — fires with **both** the project and
  its owning product (so the caller can update its active tenant in one
  go).
- \`open\` / \`onOpenChange\` — controlled-open API.

### Behaviour

- Search query filters by project \`name\` + \`stack\` case-insensitively.
- Empty result → \`—\` placeholder.
- Per-project metadata (kind chip, stack, dev count, open issues,
  open PRs) renders inline.
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProjectSwitcher>;

function DefaultTrigger({
  product,
  project,
}: {
  product: ForgeProduct;
  project: ForgeProject | null;
}) {
  return (
    <button
      type="button"
      className={`tb-chip${project ? "" : " empty"}`}
      aria-label={project ? project.name : "Pick a project"}
    >
      <span className="tb-chip-label">
        {project ? `${product.name} / ${project.name}` : "Pick a project"}
      </span>
      <span className="tb-chip-caret">
        <ChevronDown size={12} />
      </span>
    </button>
  );
}

export const Closed: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <ProjectSwitcher
        trigger={
          <DefaultTrigger product={PRODUCTS[0]} project={PRODUCTS[0].projects[0]} />
        }
        activeProductId={PRODUCTS[0].id}
        activeProjectId={PRODUCTS[0].projects[0].id}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const OpenAll: Story = {
  name: "Open · all projects grouped by product",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProjectSwitcher
        open
        onOpenChange={() => {}}
        trigger={
          <DefaultTrigger product={PRODUCTS[0]} project={PRODUCTS[0].projects[0]} />
        }
        activeProductId={PRODUCTS[0].id}
        activeProjectId={PRODUCTS[0].projects[0].id}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const OpenWithRecents: Story = {
  name: "Open · recents surfaced",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProjectSwitcher
        open
        onOpenChange={() => {}}
        trigger={
          <DefaultTrigger product={PRODUCTS[0]} project={PRODUCTS[0].projects[0]} />
        }
        activeProductId={PRODUCTS[0].id}
        activeProjectId={PRODUCTS[0].projects[0].id}
        recent={[
          { productId: "restaurant", projectId: "pos" },
          { productId: "godx", projectId: "frontend" },
          { productId: "kintai", projectId: "frontend" },
        ]}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const OpenEmptyState: Story = {
  name: "Open · no projects (empty)",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProjectSwitcher
        open
        onOpenChange={() => {}}
        trigger={<DefaultTrigger product={PRODUCTS[0]} project={null} />}
        onSelect={() => {}}
        products={[]}
      />
    </div>
  ),
};

export const OpenSubsetSingleProduct: Story = {
  name: "Open · single product scope",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProjectSwitcher
        open
        onOpenChange={() => {}}
        trigger={
          <DefaultTrigger product={PRODUCTS[0]} project={PRODUCTS[0].projects[0]} />
        }
        activeProductId={PRODUCTS[0].id}
        activeProjectId={PRODUCTS[0].projects[1].id}
        products={[PRODUCTS[0]]}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const CustomTrigger: Story = {
  name: "Custom trigger · plain button",
  render: () => (
    <div style={{ padding: 16 }}>
      <ProjectSwitcher
        trigger={<Button variant="secondary">Pick a project</Button>}
        activeProductId={PRODUCTS[0].id}
        activeProjectId={PRODUCTS[0].projects[0].id}
        onSelect={() => {}}
      />
    </div>
  ),
};

export const Playground: Story = {
  name: "Playground · controlled selection",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(true);
      const [activeProductId, setActiveProductId] = useState(PRODUCTS[0].id);
      const [activeProjectId, setActiveProjectId] = useState(PRODUCTS[0].projects[0].id);
      const product = PRODUCTS.find((p) => p.id === activeProductId)!;
      const project = product.projects.find((p) => p.id === activeProjectId) ?? null;
      return (
        <div style={{ padding: 16 }}>
          <ProjectSwitcher
            open={open}
            onOpenChange={setOpen}
            trigger={<DefaultTrigger product={product} project={project} />}
            activeProductId={activeProductId}
            activeProjectId={activeProjectId}
            recent={[
              { productId: "godx", projectId: "frontend" },
              { productId: "restaurant", projectId: "pos" },
            ]}
            onSelect={(proj, prod) => {
              setActiveProductId(prod.id);
              setActiveProjectId(proj.id);
              setOpen(false);
            }}
          />
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)" }}>
            Active: <code>{product.name}</code> / <code>{project?.name ?? "—"}</code>
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};
