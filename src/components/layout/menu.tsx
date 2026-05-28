import type { SidebarItem, SidebarSection } from "./sidebar";
import { Sidebar } from "./sidebar";

export type MenuItem = SidebarItem & {
  active?: boolean;
};

export type MenuSection = {
  label?: string;
  items: MenuItem[];
};

export type MenuProps = {
  items: MenuSection[];
};

export function Menu({ items }: MenuProps) {
  const sections: SidebarSection[] = items.map((section) => ({
    label: section.label,
    items: section.items.map(({ active: _active, ...item }) => item),
  }));
  const activeId =
    items.flatMap((section) => section.items).find((item) => item.active)?.id ??
    items[0]?.items[0]?.id ??
    "";

  return (
    <Sidebar
      activeId={activeId}
      sections={sections}
      product={{ name: "Acme Console", role: "Workspace", color: "hsl(var(--attention))" }}
    />
  );
}
