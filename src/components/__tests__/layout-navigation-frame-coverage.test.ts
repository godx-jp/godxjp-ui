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
});
