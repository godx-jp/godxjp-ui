import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("layout and navigation owner frame contracts", () => {
  it.each([
    [
      "docs/layout/resizable-panel.tsx",
      ["ResizablePanelGroup", "ResizablePanel", "ResizableHandle"],
    ],
    ["docs/layout/sidebar.tsx", ["Sidebar", "SidebarHeader", "SidebarSection", "SidebarItem"]],
    ["docs/navigation/tabs.tsx", ["Tabs", "TabsList", "TabsTrigger", "TabsContent"]],
    [
      "docs/navigation/context-menu.tsx",
      ["ContextMenu", "ContextMenuTrigger", "ContextMenuContent", "ContextMenuItem"],
    ],
    [
      "docs/navigation/dropdown-menu.tsx",
      ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuItem"],
    ],
    [
      "docs/navigation/menubar.tsx",
      ["Menubar", "MenubarMenu", "MenubarTrigger", "MenubarContent", "MenubarItem"],
    ],
    [
      "docs/navigation/navigation-menu.tsx",
      [
        "NavigationMenu",
        "NavigationMenuList",
        "NavigationMenuItem",
        "NavigationMenuTrigger",
        "NavigationMenuContent",
        "NavigationMenuLink",
      ],
    ],
    ["docs/navigation/toolbar.tsx", ["Toolbar", "ToolbarGroup"]],
  ])("renders the public compound contract in %s", (file, exports) => {
    const source = read(file as string);
    for (const name of exports as string[]) expect(source).toMatch(new RegExp(`<${name}(?:\\s|>)`));
  });

  it("keeps the executed responsive and accessibility cases addressable", () => {
    expect(read("scripts/check-layout-nav-closure.mjs")).toContain(
      "320, 375, 390, 768, 1024, 1280, 1440, 1920",
    );
    expect(read("scripts/check-layout-nav-closure.mjs")).toContain("AxeBuilder");
    expect(read("docs/layout/page-container.tsx")).toContain("breadcrumbLabel");
    expect(read("docs/layout/sidebar.tsx")).toContain("ariaLabel");
    expect(read("docs/layout/split-pane.tsx")).toContain("asideLabel");
  });

  it.each([
    [
      "docs/layout/app-shell.tsx",
      [
        "sidebar",
        "topbar",
        "topbarLeft",
        "topbarRight",
        "logo",
        "breadcrumb",
        "footer",
        "sidebarCollapsed",
      ],
    ],
    ["docs/layout/aspect-ratio.tsx", ["ratio"]],
    ["docs/layout/auth-shell.tsx", ["brand", "footer"]],
    [
      "docs/layout/page-container.tsx",
      [
        "title",
        "subtitle",
        "extra",
        "footer",
        "breadcrumb",
        "breadcrumbLabel",
        "linkComponent",
        "density",
        "variant",
        "stickyFooter",
        "footerReveal",
        "fill",
      ],
    ],
    ["docs/layout/flex.tsx", ["direction", "gap", "align", "justify", "wrap"]],
    [
      "docs/layout/resizable-panel.tsx",
      [
        "orientation",
        "defaultSize",
        "minSize",
        "maxSize",
        "collapsible",
        "collapsedSize",
        "disabled",
        "onResize",
      ],
    ],
    ["docs/layout/separator.tsx", ["orientation", "decorative"]],
    ["docs/layout/split-pane.tsx", ["aside", "asideWidth", "asideLabel"]],
    ["docs/layout/topbar.tsx", ["start", "center", "end", "children"]],
    ["docs/navigation/breadcrumb.tsx", ["items", "linkComponent", "ariaLabel"]],
    [
      "docs/navigation/app-setting-picker.tsx",
      ["kind", "appearance", "disabled", "value", "onValueChange"],
    ],
    [
      "docs/navigation/steps.tsx",
      [
        "items",
        "value",
        "defaultValue",
        "status",
        "orientation",
        "type",
        "size",
        "titlePlacement",
        "onValueChange",
      ],
    ],
  ])("maps every behavioral primary prop in %s", (file, props) => {
    const source = read(file as string);
    for (const prop of props as string[]) expect(source).toContain(prop);
  });
});
