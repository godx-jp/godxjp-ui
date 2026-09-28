import * as React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, renderWithUi, screen } from "@/test/render";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

/**
 * gh#1020 — `<Tabs items aria-label>` put the name on the ROOT `<div>`, which has no role, so the
 * `role="tablist"` was unnamed and the root carried an `aria-label` ARIA 1.2 prohibits on a
 * generic. WAI-ARIA APG Tabs: the name belongs on the tablist.
 */
describe("Tabs · the accessible name lands on the tablist (gh#1020)", () => {
  const items = [
    { value: "a", label: "A", content: "Panel A" },
    { value: "b", label: "B", content: "Panel B" },
  ];

  it("items API: aria-label names role=tablist and leaves the root without one", () => {
    const { container } = renderWithUi(<Tabs aria-label="対応状況" items={items} />);

    expect(screen.getByRole("tablist", { name: "対応状況" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="tabs"]')).not.toHaveAttribute("aria-label");
  });

  it("items API: aria-labelledby is moved to the tablist as well", () => {
    const { container } = renderWithUi(
      <>
        <h2 id="tabs-heading">受信箱</h2>
        <Tabs aria-labelledby="tabs-heading" items={items} />
      </>,
    );

    expect(screen.getByRole("tablist", { name: "受信箱" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="tabs"]')).not.toHaveAttribute("aria-labelledby");
  });

  it("compound API: a root aria-label reaches the TabsList; the list's own label still wins", () => {
    const { container, rerender } = renderWithUi(
      <Tabs aria-label="保存ビュー" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist", { name: "保存ビュー" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="tabs"]')).not.toHaveAttribute("aria-label");

    rerender(
      <Tabs aria-label="保存ビュー" defaultValue="a">
        <TabsList aria-label="自分の名前">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist", { name: "自分の名前" })).toBeInTheDocument();
  });
});

/**
 * gh#1021 — a status strip (未対応 / 対応中 / 完了) that drives content OUTSIDE the Tabs. The
 * `items` API always rendered a `tabpanel`, so the strip shipped an empty panel; moving the view
 * INTO the panel remounted it on every switch and dropped the unsent reply draft.
 *
 * `controls` is strip-only mode: no `tabpanel` is rendered and the selected tab's `aria-controls`
 * points at the consumer's own region (APG Tabs — the tab still controls a real element).
 */
describe("Tabs · strip-only mode via `controls` (gh#1021)", () => {
  let mounts = 0;
  function DetailView() {
    const [draft, setDraft] = React.useState("");
    React.useEffect(() => {
      mounts += 1;
    }, []);
    return (
      <textarea
        aria-label="返信"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    );
  }

  const statusItems = [
    { value: "open", label: "未対応" },
    { value: "doing", label: "対応中" },
    { value: "done", label: "完了" },
  ];

  it("renders no tabpanel and points the selected tab at the consumer's region", () => {
    mounts = 0;
    renderWithUi(
      <>
        <Tabs aria-label="対応状況" controls="inbox-view" items={statusItems} />
        <section id="inbox-view" aria-label="スレッド">
          <DetailView />
        </section>
      </>,
    );

    expect(screen.queryAllByRole("tabpanel")).toHaveLength(0);
    expect(screen.getByRole("tab", { name: "未対応" })).toHaveAttribute(
      "aria-controls",
      "inbox-view",
    );
    // RAC's own rule survives: only the SELECTED tab claims the region.
    expect(screen.getByRole("tab", { name: "対応中" })).not.toHaveAttribute("aria-controls");

    // Switching tabs does not remount the consumer's view — the draft survives.
    fireEvent.change(screen.getByRole("textbox", { name: "返信" }), {
      target: { value: "下書き" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "対応中" }));
    fireEvent.click(screen.getByRole("tab", { name: "完了" }));

    expect(screen.getByRole("tab", { name: "完了" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "完了" })).toHaveAttribute(
      "aria-controls",
      "inbox-view",
    );
    expect(screen.queryAllByRole("tabpanel")).toHaveLength(0);
    expect(screen.getByRole("textbox", { name: "返信" })).toHaveValue("下書き");
    expect(mounts).toBe(1);
  });

  it("compound API: `controls` on the root points a panel-less strip at the region", () => {
    renderWithUi(
      <>
        <Tabs aria-label="保存ビュー" controls="grid" defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
        </Tabs>
        <div id="grid" />
      </>,
    );

    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-controls", "grid");
    expect(screen.queryAllByRole("tabpanel")).toHaveLength(0);
  });

  it("a declared TabsContent still wins over `controls`", () => {
    renderWithUi(
      <Tabs aria-label="View" controls="elsewhere" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
      </Tabs>,
    );

    const controls = screen.getByRole("tab", { name: "A" }).getAttribute("aria-controls");
    expect(controls).not.toBe("elsewhere");
    expect(document.getElementById(controls as string)).toHaveAttribute("role", "tabpanel");
  });
});

/**
 * gh#1021 (second half) — `count` on the compound `TabsTrigger`, drawn exactly as the `items`
 * API draws `TabItemProp.count`: same pill markup, same accessible name.
 */
describe("TabsTrigger · count matches the items API (gh#1021)", () => {
  it("renders the same pill and the same accessible name as an items tab", () => {
    const itemsView = renderWithUi(
      <Tabs
        aria-label="items"
        items={[
          {
            value: "open",
            label: "未対応",
            count: 1234,
            overflowCount: 9999,
            countLabel: "件の課題",
            content: null,
          },
        ]}
      />,
    );
    const itemsTab = screen.getByRole("tab");
    const itemsName = itemsTab.textContent;
    const itemsPill = itemsTab.querySelector('[data-slot="tabs-count"]')?.outerHTML;
    const itemsClass = itemsTab.className;
    expect(itemsPill).toBeTruthy();
    itemsView.unmount();

    renderWithUi(
      <Tabs aria-label="compound" defaultValue="open">
        <TabsList>
          <TabsTrigger value="open" count={1234} overflowCount={9999} countLabel="件の課題">
            未対応
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const compoundTab = screen.getByRole("tab");

    expect(compoundTab.querySelector('[data-slot="tabs-count"]')?.outerHTML).toBe(itemsPill);
    expect(compoundTab.textContent).toBe(itemsName);
    expect(compoundTab.className).toBe(itemsClass);
  });

  it("honours showZero={false} and renders nothing without a count", () => {
    const { container } = renderWithUi(
      <Tabs aria-label="compound" defaultValue="a">
        <TabsList>
          <TabsTrigger value="a" count={0} showZero={false}>
            A
          </TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
          <TabsTrigger value="c" count={0}>
            C
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    expect(container.querySelectorAll('[data-slot="tabs-count"]')).toHaveLength(1);
  });
});
