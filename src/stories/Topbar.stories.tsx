import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Bell, HelpCircle } from "lucide-react";
import { Topbar } from "../components/shell/Topbar";
import { ProductSwitcher } from "../components/shell/ProductSwitcher";
import { ProjectSwitcher } from "../components/shell/ProjectSwitcher";
import { CommandPalette } from "../components/shell/CommandPalette";
import { TweaksPanel } from "../components/shell/TweaksPanel";
import { Avatar } from "../components/primitives/Avatar";
import { Button } from "../components/primitives/Button";
import { Badge } from "../components/primitives/Badge";
import { PRODUCTS } from "../data/products";

const meta: Meta<typeof Topbar> = {
  title: "Shell/Topbar",
  component: Topbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
\`Topbar\` is the header rail rendered inside \`AppShell\`'s topbar slot.
It hosts five canonical controls:

1. **Sidebar collapse toggle** — when \`onToggleCollapsed\` is supplied,
   renders the \`PanelLeftClose\` / \`PanelLeftOpen\` icon button. The
   \`collapsed\` prop mirrors \`useTweaks.sidebarCollapsed\`.
2. **Product chip** — opens \`ProductSwitcher\` via \`onProductOpen\`.
3. **Project chip** — opens \`ProjectSwitcher\` via \`onProjectOpen\`.
   Renders as a dashed empty chip when \`project\` is \`null\`.
4. **Search shortcut** — opens \`CommandPalette\` (\`⌘K\`) via
   \`onSearchOpen\`. Always visible at the right edge of the left rail.
5. **Tweaks button** — opens \`TweaksPanel\` via \`onTweaksOpen\`. Optional;
   omit the handler to hide.

Plus an optional \`rightSlot\` for service-supplied widgets (notification
bell, avatar menu, help link).

### Composition pattern

The switcher popovers themselves render via callbacks supplied by the
host page (so the host owns open state + can wire keyboard nav). This
component renders the **closed chips** and invokes the handlers.
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Topbar>;

// Visual frame so the topbar gets the right height + styling outside
// the AppShell grid.
function TopbarFrame({ children }: { children: React.ReactNode }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: "var(--header-height, 48px)",
        padding: "0 12px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-1)",
      }}
    >
      {children}
    </header>
  );
}

export const Default: Story = {
  render: () => (
    <TopbarFrame>
      <Topbar
        product={PRODUCTS[0]}
        project={PRODUCTS[0].projects[0]}
        onProductOpen={() => {}}
        onProjectOpen={() => {}}
        onSearchOpen={() => {}}
        onTweaksOpen={() => {}}
      />
    </TopbarFrame>
  ),
};

export const EmptyProjectChip: Story = {
  name: "Project chip · empty (dashed)",
  render: () => (
    <TopbarFrame>
      <Topbar
        product={PRODUCTS[0]}
        project={null}
        onProductOpen={() => {}}
        onProjectOpen={() => {}}
        onSearchOpen={() => {}}
      />
    </TopbarFrame>
  ),
};

export const Collapsed: Story = {
  name: "Collapse toggle · pressed",
  render: () => (
    <TopbarFrame>
      <Topbar
        collapsed
        onToggleCollapsed={() => {}}
        product={PRODUCTS[0]}
        project={PRODUCTS[0].projects[0]}
        onProductOpen={() => {}}
        onProjectOpen={() => {}}
        onSearchOpen={() => {}}
      />
    </TopbarFrame>
  ),
};

export const NoTweaksButton: Story = {
  name: "Without tweaks button",
  render: () => (
    <TopbarFrame>
      <Topbar
        product={PRODUCTS[0]}
        project={PRODUCTS[0].projects[0]}
        onProductOpen={() => {}}
        onProjectOpen={() => {}}
        onSearchOpen={() => {}}
      />
    </TopbarFrame>
  ),
};

export const RightSlotNotifications: Story = {
  name: "rightSlot · notification bell + avatar",
  render: () => (
    <TopbarFrame>
      <Topbar
        product={PRODUCTS[0]}
        project={PRODUCTS[0].projects[0]}
        onProductOpen={() => {}}
        onProjectOpen={() => {}}
        onSearchOpen={() => {}}
        onTweaksOpen={() => {}}
        rightSlot={
          <>
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <Bell size={14} />
              <Badge>3</Badge>
            </Button>
            <Button variant="ghost" size="sm" aria-label="Help">
              <HelpCircle size={14} />
            </Button>
            <Avatar size="sm" src="https://i.pravatar.cc/64?u=satoshi" alt="Satoshi">SF</Avatar>
          </>
        }
      />
    </TopbarFrame>
  ),
};

export const Minimal: Story = {
  name: "Minimal · no handlers wired (read-only display)",
  render: () => (
    <TopbarFrame>
      <Topbar product={PRODUCTS[0]} project={PRODUCTS[0].projects[0]} />
    </TopbarFrame>
  ),
};

export const TenantVariantKintai: Story = {
  name: "Tenant variant · dxs-kintai",
  render: () => (
    <TopbarFrame>
      <Topbar
        product={PRODUCTS.find((p) => p.tenant === "kintai")!}
        project={PRODUCTS.find((p) => p.tenant === "kintai")!.projects[0]}
        onProductOpen={() => {}}
        onProjectOpen={() => {}}
        onSearchOpen={() => {}}
        onTweaksOpen={() => {}}
      />
    </TopbarFrame>
  ),
};

// Wires every callback to a real open-state so the developer can play
// with the topbar + every overlay it surfaces.
export const Playground: Story = {
  name: "Playground · all overlays wired",
  render: () => {
    function Demo() {
      const [productOpen, setProductOpen] = useState(false);
      const [projectOpen, setProjectOpen] = useState(false);
      const [paletteOpen, setPaletteOpen] = useState(false);
      const [tweaksOpen, setTweaksOpen] = useState(false);
      const [collapsed, setCollapsed] = useState(false);
      const [activeProductId, setActiveProductId] = useState("restaurant");
      const [activeProjectId, setActiveProjectId] = useState("api");
      const product = PRODUCTS.find((p) => p.id === activeProductId) ?? PRODUCTS[0];
      const project = product.projects.find((p) => p.id === activeProjectId) ?? null;
      return (
        <>
          <TopbarFrame>
            <Topbar
              collapsed={collapsed}
              onToggleCollapsed={() => setCollapsed((c) => !c)}
              product={product}
              project={project}
              onProductOpen={() => setProductOpen(true)}
              onProjectOpen={() => setProjectOpen(true)}
              onSearchOpen={() => setPaletteOpen(true)}
              onTweaksOpen={() => setTweaksOpen(true)}
              rightSlot={
                <Button variant="ghost" size="sm">
                  <Bell size={14} />
                </Button>
              }
            />
          </TopbarFrame>
          <ProductSwitcher
            trigger={<span style={{ display: "none" }} />}
            open={productOpen}
            onOpenChange={setProductOpen}
            activeId={activeProductId}
            onSelect={(p) => {
              setActiveProductId(p.id);
              setProductOpen(false);
            }}
          />
          <ProjectSwitcher
            trigger={<span style={{ display: "none" }} />}
            open={projectOpen}
            onOpenChange={setProjectOpen}
            activeProductId={activeProductId}
            activeProjectId={activeProjectId}
            onSelect={(proj, prod) => {
              setActiveProductId(prod.id);
              setActiveProjectId(proj.id);
              setProjectOpen(false);
            }}
          />
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            commands={[
              { id: "new-issue", label: "New issue", group: "Actions", onSelect: () => {} },
              { id: "open-pr", label: "Open pull request", group: "Actions", onSelect: () => {} },
              { id: "go-home", label: "Go home", group: "Navigation", hint: "g h", onSelect: () => {} },
            ]}
          />
          <TweaksPanel open={tweaksOpen} onOpenChange={setTweaksOpen} />
        </>
      );
    }
    return <Demo />;
  },
};
