import * as Popover from "@radix-ui/react-popover";
import { Check, Clock, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PRODUCTS, type ForgeProduct, type ForgeProject } from "../../data/products";
import { cn } from "../cn";

export interface RecentProject {
  productId: string;
  projectId: string;
}

export interface ProjectSwitcherProps {
  trigger: ReactNode;
  /** Currently active product+project, used for the ✓ marker. */
  activeProductId?: string;
  activeProjectId?: string;
  /** Optional list of recent (product, project) tuples — surfaces them first. */
  recent?: RecentProject[];
  products?: ForgeProduct[];
  onSelect: (project: ForgeProject, product: ForgeProduct) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ProjectSwitcher — Linear-style cross-product project picker.
//
// Search runs against every product's projects; results are grouped
// by their owning product so the visual hierarchy stays clear.
// "Recent" surfaces last-N projects the user opened so jumping back
// is a single click. Selecting a project in a different product auto-
// changes the active tenant (caller's responsibility — it gets both
// the project and its product).
//
// Per MUST RULE #12 this is THE project switcher across the system.
export function ProjectSwitcher({
  trigger,
  activeProductId,
  activeProjectId,
  recent = [],
  products = PRODUCTS,
  onSelect,
  open,
  onOpenChange,
}: ProjectSwitcherProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const productById = new Map(products.map((p) => [p.id, p]));
  const recentResolved = recent
    .map((r) => {
      const product = productById.get(r.productId);
      const project = product?.projects.find((p) => p.id === r.projectId);
      return product && project ? { product, project } : null;
    })
    .filter((x): x is { product: ForgeProduct; project: ForgeProject } => !!x)
    .slice(0, 3);

  const q = query.trim().toLowerCase();
  const filteredProducts = products
    .map((product) => ({
      product,
      projects: q
        ? product.projects.filter(
            (p) =>
              p.name.toLowerCase().includes(q) || p.stack.toLowerCase().includes(q),
          )
        : product.projects,
    }))
    .filter((group) => group.projects.length > 0);

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="sw-pop"
          style={{ width: 420 }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="sw-pop-search">
            <Search size={14} className="text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("shell.searchProjects")}
              className="flex-1 bg-transparent outline-none"
            />
            <kbd className="kbd">esc</kbd>
          </div>

          <div className="sw-pop-list">
            {!q && recentResolved.length > 0 && (
              <>
                <div className="sw-pop-section">
                  <span>{t("shell.recent")}</span>
                </div>
                {recentResolved.map(({ product, project }) => (
                  <button
                    key={`${product.id}:${project.id}`}
                    type="button"
                    className="sw-pop-item w-full text-left"
                    onClick={() => onSelect(project, product)}
                  >
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="flex-1 min-w-0 truncate font-mono text-xs">
                      {project.name}
                    </span>
                    <span className="sw-pop-item-meta truncate">{product.name}</span>
                  </button>
                ))}
              </>
            )}

            {filteredProducts.length === 0 && (
              <div className="sw-pop-empty">—</div>
            )}

            {filteredProducts.map(({ product, projects }) => (
              <div key={product.id}>
                <div className="sw-pop-section">
                  <span className="flex items-center gap-2">
                    <span
                      className="sb-logo-mark"
                      style={{ background: product.color, width: 12, height: 12, fontSize: 8 }}
                    >
                      {product.name[0]?.toUpperCase() ?? "?"}
                    </span>
                    {product.name}
                  </span>
                  <span>{projects.length}</span>
                </div>
                {projects.map((project) => {
                  const isActive =
                    product.id === activeProductId && project.id === activeProjectId;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      className={cn("sw-pop-item w-full text-left")}
                      data-active={isActive}
                      onClick={() => onSelect(project, product)}
                    >
                      <span className="font-mono text-xs truncate flex-1 min-w-0">
                        {project.name}
                      </span>
                      <span className="sw-kind-chip">{project.kind}</span>
                      <span className="sw-pop-item-meta">
                        {project.stack} · {project.devs}d · {project.openIssues}↗ ·{" "}
                        {project.prs}pr
                      </span>
                      {isActive && <Check size={12} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="sw-pop-foot">
            <span>{t("shell.browseAllProducts")}</span>
            <span className="ml-auto">
              <kbd className="kbd">↑↓</kbd> <kbd className="kbd">⏎</kbd>
            </span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
