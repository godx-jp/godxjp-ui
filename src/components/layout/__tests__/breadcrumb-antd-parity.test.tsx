import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

import { Breadcrumb } from "../breadcrumb";

const TRAIL = [
  { label: "ホーム", to: "/" },
  { label: "設定", to: "/settings" },
  { label: "プロフィール" },
];

/** Ant Design 6.6.2 parity, read off `antd/es/breadcrumb/Breadcrumb.d.ts` + `BreadcrumbItem.d.ts`. */
describe("Breadcrumb — antd `separator`", () => {
  it("defaults to the chevron glyph, one per join and never a trailing one", () => {
    const { container } = renderWithUi(<Breadcrumb items={TRAIL} />);
    const separators = container.querySelectorAll(".ui-breadcrumb-separator");
    expect(separators).toHaveLength(TRAIL.length - 1);
    expect(separators[0].querySelector("svg")).not.toBeNull();
  });

  it("takes a string, and keeps it out of the accessible tree", () => {
    const { container } = renderWithUi(<Breadcrumb items={TRAIL} separator="/" />);
    const separators = container.querySelectorAll(".ui-breadcrumb-separator");
    expect(separators).toHaveLength(TRAIL.length - 1);
    expect(separators[0]).toHaveTextContent("/");
    // A screen reader must never read "home slash settings" — the trail's structure is the ol/li.
    expect(separators[0]).toHaveAttribute("aria-hidden", "true");
    expect(separators[0].querySelector("svg")).toBeNull();
  });

  it("an empty separator removes the glyph but keeps the segments", () => {
    const { container } = renderWithUi(<Breadcrumb items={TRAIL} separator="" />);
    expect(container.querySelectorAll(".ui-breadcrumb-separator")[0]).toBeEmptyDOMElement();
    expect(screen.getAllByRole("listitem")).toHaveLength(TRAIL.length);
  });
});

describe("Breadcrumb — antd `itemRender`", () => {
  it("replaces a segment's content while the trail keeps owning nav / ol / li", () => {
    renderWithUi(
      <Breadcrumb
        items={TRAIL}
        itemRender={(item, { index, isLast, items }) => (
          <span data-testid={`seg-${index}`}>
            {String(item.label)}
            {isLast ? ` (${items.length})` : ""}
          </span>
        )}
      />,
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByTestId("seg-2")).toHaveTextContent("プロフィール (3)");
    // The default anchors are gone — itemRender OWNS the segment body.
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("still draws the separators, which are the trail's job and not the renderer's", () => {
    const { container } = renderWithUi(
      <Breadcrumb items={TRAIL} itemRender={(item) => <span>{String(item.label)}</span>} />,
    );
    expect(container.querySelectorAll(".ui-breadcrumb-separator")).toHaveLength(2);
  });
});

describe("Breadcrumb — antd `BreadcrumbItemType.menu`", () => {
  const withMenu = [
    { label: "ホーム", to: "/" },
    {
      label: "プロジェクトA",
      to: "/p/a",
      menu: {
        items: [
          { value: "b", label: "プロジェクトB", to: "/p/b" },
          { value: "c", label: "プロジェクトC" },
          { value: "d", label: "プロジェクトD", disabled: true },
        ],
      },
    },
    { label: "設定" },
  ];

  it("turns the segment into a menu button rather than a link that goes nowhere", () => {
    renderWithUi(<Breadcrumb items={withMenu} />);
    const trigger = screen.getByRole("button", { name: /プロジェクトA/ });
    // ARIA true and menu both announce a menu popup; React Aria emits true.
    expect(trigger).toHaveAttribute("aria-haspopup", "true");
    expect(screen.queryByRole("link", { name: /プロジェクトA/ })).toBeNull();
  });

  it("opens the siblings, links the ones with a path and disables the ones told to be", async () => {
    const user = userEvent.setup();
    renderWithUi(<Breadcrumb items={withMenu} />);

    await user.click(screen.getByRole("button", { name: /プロジェクトA/ }));
    // An entry with a path is a real anchor, so middle-click / "open in new tab" work — but its
    // ROLE stays `menuitem`, which is what a menu's children have to be.
    const linked = screen.getByRole("menuitem", { name: "プロジェクトB" });
    expect(linked.tagName).toBe("A");
    expect(linked).toHaveAttribute("href", "/p/b");
    expect(screen.getByRole("menuitem", { name: "プロジェクトD" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("reports the chosen sibling's own value", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUi(
      <Breadcrumb
        items={[
          withMenu[0],
          { ...withMenu[1], menu: { ...withMenu[1].menu!, onSelect } },
          withMenu[2],
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: /プロジェクトA/ }));
    await user.click(screen.getByRole("menuitem", { name: "プロジェクトC" }));
    expect(onSelect).toHaveBeenCalledWith("c");
  });

  it("leaves a plain segment a plain link", () => {
    renderWithUi(<Breadcrumb items={withMenu} />);
    expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute("href", "/");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(<Breadcrumb items={withMenu} separator="/" />);
  });
});
