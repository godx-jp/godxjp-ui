import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Cascader } from "../cascader";
import { TreeSelect } from "../tree-select";
import { Transfer } from "../transfer";
import { REGION_OPTIONS, ORG_TREE, TRANSFER_MOCK } from "../__fixtures__/tree-options";
import {
  collectAllPaths,
  collectLeafPaths,
  filterTreeOptions,
  formatPathLabels,
  getNodeByPath,
  normalizeTreeOptions,
  pathKey,
} from "../tree-utils";

describe("tree-utils", () => {
  const options = normalizeTreeOptions(REGION_OPTIONS);

  it("resolves path labels", () => {
    const path = ["vn", "hcm", "q1"];
    expect(formatPathLabels(getNodeByPath(options, path))).toBe(
      "Việt Nam / TP. Hồ Chí Minh / Quận 1",
    );
  });

  it("collects leaf paths", () => {
    const paths = collectAllPaths(options);
    expect(paths.some((p) => pathKey(p.path) === pathKey(["jp", "tokyo", "shibuya"]))).toBe(true);
  });

  it("collects nested leaf path labels from tree root", () => {
    const paths = collectLeafPaths(options);
    const shinjuku = paths.find((p) => pathKey(p.path) === pathKey(["jp", "tokyo", "shinjuku"]));
    expect(shinjuku?.labels.join(" / ")).toBe("日本 / 東京都 / 新宿区");
  });

  it("collects nested node labels from tree root", () => {
    const paths = collectAllPaths(options);
    const tokyo = paths.find((p) => pathKey(p.path) === pathKey(["jp", "tokyo"]));
    expect(tokyo?.labels.join(" / ")).toBe("日本 / 東京都");
  });

  it("filters leaf paths by label (case-insensitive)", () => {
    const matches = filterTreeOptions(options, "QUẬN 1");
    expect(matches).toHaveLength(1);
    expect(matches[0]?.labels.join(" / ")).toBe("Việt Nam / TP. Hồ Chí Minh / Quận 1");
  });

  it("returns empty array for blank search query", () => {
    expect(filterTreeOptions(options, "   ")).toEqual([]);
  });

  it("matches any segment in the path chain", () => {
    const matches = filterTreeOptions(options, "東京都");
    expect(matches.some((m) => pathKey(m.path) === pathKey(["jp", "tokyo", "shinjuku"]))).toBe(
      true,
    );
    expect(matches.some((m) => pathKey(m.path) === pathKey(["jp", "tokyo", "shibuya"]))).toBe(true);
  });
});

describe("Cascader", () => {
  it("renders trigger with placeholder", () => {
    renderWithUi(<Cascader options={REGION_OPTIONS} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Chọn…")).toBeInTheDocument();
  });

  it("selects a leaf path", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(<Cascader options={REGION_OPTIONS} onValueChange={onChange} />);
    await user.click(screen.getByRole("combobox"));

    await user.click(screen.getByRole("option", { name: /việt nam/i }));
    await user.click(screen.getByRole("option", { name: /tp\. hồ chí minh/i }));
    await user.click(screen.getByRole("option", { name: /quận 1/i }));

    expect(onChange).toHaveBeenCalledWith(["vn", "hcm", "q1"], expect.any(Array));
  });

  it("shows cascade columns when showSearch is on and query is empty", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <Cascader options={REGION_OPTIONS} showSearch defaultValue={["jp", "tokyo", "shinjuku"]} />,
    );
    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: /việt nam/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^日本$/i })).toBeInTheDocument();
    // Cascade columns are listboxes; the flat search-results listbox is not rendered when the query is empty.
    expect(screen.queryByPlaceholderText(/tìm kiếm/i)).toHaveValue("");
    expect(
      screen.queryByRole("option", { name: "日本 / 東京都 / 新宿区" }),
    ).not.toBeInTheDocument();
  });

  it("filters leaf paths when searching", async () => {
    const user = userEvent.setup();

    renderWithUi(<Cascader options={REGION_OPTIONS} showSearch />);
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText(/tìm kiếm/i), "新宿");

    expect(await screen.findByRole("option", { name: /新宿区/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /^việt nam$/i })).not.toBeInTheDocument();
  });

  it("selects a path from search results", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(<Cascader options={REGION_OPTIONS} showSearch onValueChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText(/tìm kiếm/i), "quận 3");

    await user.click(await screen.findByRole("option", { name: /quận 3/i }));

    expect(onChange).toHaveBeenCalledWith(["vn", "hcm", "q3"], expect.any(Array));
  });

  it("shows default value label on trigger", () => {
    renderWithUi(
      <Cascader options={REGION_OPTIONS} showSearch defaultValue={["jp", "tokyo", "shinjuku"]} />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("日本 / 東京都 / 新宿区");
  });

  it("clears search when popover closes", async () => {
    const user = userEvent.setup();

    renderWithUi(<Cascader options={REGION_OPTIONS} showSearch />);
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText(/tìm kiếm/i), "新宿");
    expect(await screen.findByRole("option", { name: /新宿区/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("combobox"));

    expect(screen.getByPlaceholderText(/tìm kiếm/i)).toHaveValue("");
    expect(screen.getByRole("option", { name: /việt nam/i })).toBeInTheDocument();
  });

  it("expands cascade columns when clicking a parent node", async () => {
    const user = userEvent.setup();

    renderWithUi(<Cascader options={REGION_OPTIONS} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /việt nam/i }));

    expect(screen.getByRole("option", { name: /tp\. hồ chí minh/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /hà nội/i })).toBeInTheDocument();
  });

  it("commits intermediate path when changeOnSelect is enabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(<Cascader options={REGION_OPTIONS} changeOnSelect onValueChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /việt nam/i }));

    expect(onChange).toHaveBeenCalledWith(["vn"], expect.any(Array));
  });

  it("clears selected value via clear icon", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(
      <Cascader
        options={REGION_OPTIONS}
        defaultValue={["vn", "hcm", "q1"]}
        onValueChange={onChange}
      />,
    );

    const combobox = screen.getByRole("combobox");
    // The clear control is a sibling of the trigger, NOT nested inside it — a <button> may not
    // be a descendant of the trigger <button> (invalid HTML / hydration error).
    const clearButton = screen.getByRole("button", { name: /xóa lựa chọn/i });
    expect(combobox.contains(clearButton)).toBe(false);
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith([], expect.any(Array));
    expect(combobox).toHaveTextContent("Chọn…");
  });

  it("shows empty state when search has no matches", async () => {
    const user = userEvent.setup();

    renderWithUi(<Cascader options={REGION_OPTIONS} showSearch />);
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText(/tìm kiếm/i), "xyz-no-match");

    expect(await screen.findByText(/không có kết quả/i)).toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();

    renderWithUi(<Cascader options={REGION_OPTIONS} disabled defaultValue={["vn", "hcm", "q1"]} />);
    await user.click(screen.getByRole("combobox"));

    expect(screen.queryByRole("button", { name: /việt nam/i })).not.toBeInTheDocument();
  });

  it("supports multiple selection without closing panel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(
      <Cascader options={REGION_OPTIONS} multiple showSearch onValueChange={onChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText(/tìm kiếm/i), "quận 1");
    await user.click(await screen.findByRole("option", { name: /quận 1/i }));

    expect(onChange).toHaveBeenCalledWith([["vn", "hcm", "q1"]], expect.any(Array));
    expect(screen.getAllByRole("combobox")[0]).toHaveTextContent(
      "Việt Nam / TP. Hồ Chí Minh / Quận 1",
    );

    const search = screen.getByPlaceholderText(/tìm kiếm/i);
    await user.clear(search);
    await user.type(search, "quận 3");
    await user.click(await screen.findByRole("option", { name: /quận 3/i }));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        ["vn", "hcm", "q1"],
        ["vn", "hcm", "q3"],
      ]),
      expect.any(Array),
    );
  });

  it("reflects controlled single value on trigger", () => {
    renderWithUi(
      <Cascader
        options={REGION_OPTIONS}
        value={["jp", "tokyo", "shibuya"]}
        onValueChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("日本 / 東京都 / 渋谷区");
  });

  // ── Regression tests codifying browser-found behaviours (godxjp-ui-behavioral-test) ──

  // Aggregate / flag fixtures (REGION_OPTIONS has no disabled/disableCheckbox nodes).
  const AGG_OPTIONS = [
    {
      value: "ops",
      label: "Ops",
      children: [
        { value: "a", label: "Alpha" },
        { value: "b", label: "Bravo" },
      ],
    },
  ];
  const FLAG_OPTIONS = [
    {
      value: "dom",
      label: "Domestic",
      children: [
        { value: "std", label: "Standard" },
        { value: "exp", label: "Express", disableCheckbox: true },
      ],
    },
  ];
  const checkboxState = (optionName: RegExp) =>
    screen
      .getByRole("option", { name: optionName })
      .querySelector('[data-slot="checkbox"]')
      ?.getAttribute("data-state");

  it("changeOnSelect: a parent click commits it but keeps the panel open to drill deeper", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<Cascader options={REGION_OPTIONS} changeOnSelect onValueChange={onChange} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /việt nam/i }));
    // Committed the intermediate node…
    expect(onChange).toHaveBeenCalledWith(["vn"], expect.any(Array));
    // …but the panel stayed open and expanded its children (drill must not close on parent click).
    expect(screen.getByRole("option", { name: /tp\. hồ chí minh/i })).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: /tp\. hồ chí minh/i }));
    await user.click(screen.getByRole("option", { name: /quận 1/i }));
    expect(onChange).toHaveBeenLastCalledWith(["vn", "hcm", "q1"], expect.any(Array));
  });

  it("multiple: a disableCheckbox leaf cannot be toggled (but its siblings can)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<Cascader options={FLAG_OPTIONS} multiple onValueChange={onChange} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /domestic/i }));
    await user.click(screen.getByRole("option", { name: /express/i }));
    expect(onChange).not.toHaveBeenCalled(); // disableCheckbox path is not selectable

    await user.click(screen.getByRole("option", { name: /standard/i }));
    expect(onChange).toHaveBeenCalledWith([["dom", "std"]], expect.any(Array));
  });

  it("multiple: parent checkbox reflects descendant state (none → indeterminate → checked)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={AGG_OPTIONS} multiple onValueChange={vi.fn()} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /ops/i })); // expand
    expect(checkboxState(/ops/i)).toBe("unchecked");

    await user.click(screen.getByRole("option", { name: /alpha/i }));
    expect(checkboxState(/ops/i)).toBe("indeterminate"); // some children selected

    await user.click(screen.getByRole("option", { name: /bravo/i }));
    expect(checkboxState(/ops/i)).toBe("checked"); // all children selected
  });

  it("multiple: option rows contain no nested <button> (valid HTML, no hydration error)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Cascader options={AGG_OPTIONS} multiple onValueChange={vi.fn()} />);

    await user.click(screen.getByRole("combobox"));
    for (const option of screen.getAllByRole("option")) {
      expect(option.querySelector("button")).toBeNull();
    }
  });
});

describe("TreeSelect", () => {
  it("renders tree trigger", () => {
    renderWithUi(<TreeSelect treeData={ORG_TREE} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Chọn…")).toBeInTheDocument();
  });

  it("selects a leaf in single mode and closes panel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(<TreeSelect treeData={ORG_TREE} treeDefaultExpandAll onValueChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("button", { name: /kho osaka/i }));

    expect(onChange).toHaveBeenCalledWith("warehouse-osaka");
    expect(screen.queryByRole("button", { name: /kho osaka/i })).not.toBeInTheDocument();
  });

  it("filters visible nodes when showSearch is enabled", async () => {
    const user = userEvent.setup();

    renderWithUi(<TreeSelect treeData={ORG_TREE} showSearch treeDefaultExpandAll />);
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText(/tìm kiếm/i), "media");

    expect(screen.getByRole("button", { name: /^media$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /kho osaka/i })).not.toBeInTheDocument();
  });

  it("expands and collapses branch nodes", async () => {
    const user = userEvent.setup();

    renderWithUi(<TreeSelect treeData={ORG_TREE} />);
    await user.click(screen.getByRole("combobox"));

    expect(screen.queryByRole("button", { name: /^logistics$/i })).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /mở rộng/i })[0]);
    expect(screen.getByRole("button", { name: /^logistics$/i })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /thu gọn/i })[0]);
    expect(screen.queryByRole("button", { name: /^logistics$/i })).not.toBeInTheDocument();
  });

  it("selects a node in checkable mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function Demo() {
      const [value, setValue] = React.useState<string[]>([]);
      return (
        <TreeSelect
          treeData={ORG_TREE}
          treeCheckable
          treeDefaultExpandAll
          value={value}
          onValueChange={(v) => {
            setValue(Array.isArray(v) ? v : v ? [v] : []);
            onChange(v);
          }}
        />
      );
    }

    renderWithUi(<Demo />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("checkbox", { name: /kho osaka/i }));

    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(["warehouse-osaka"]));
  });

  it("clears selection via clear icon", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(
      <TreeSelect
        treeData={ORG_TREE}
        treeDefaultExpandAll
        defaultValue="warehouse-osaka"
        onValueChange={onChange}
      />,
    );

    const combobox = screen.getByRole("combobox");
    const clearIcon = combobox.querySelector("svg.lucide-x");
    expect(clearIcon).toBeTruthy();
    await user.click(clearIcon!);

    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(combobox).toHaveTextContent("Chọn…");
  });
});

describe("Transfer", () => {
  it("moves items to target", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function Demo() {
      const [targetKeys, setTargetKeys] = React.useState<string[]>([]);
      return (
        <Transfer
          dataSource={TRANSFER_MOCK}
          targetKeys={targetKeys}
          onValueChange={(next, direction, moveKeys) => {
            setTargetKeys(next);
            onChange(next, direction, moveKeys);
          }}
          showSearch
        />
      );
    }

    renderWithUi(<Demo />);
    await user.click(screen.getByText("NV-001"));
    await user.click(screen.getByRole("button", { name: /chuyển sang đích/i }));

    expect(onChange).toHaveBeenCalledWith(["user-1"], "right", ["user-1"]);
  });

  it("filters source list via search", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <Transfer dataSource={TRANSFER_MOCK} targetKeys={[]} onValueChange={vi.fn()} showSearch />,
    );
    const searchInputs = screen.getAllByRole("searchbox");
    await user.type(searchInputs[0], "NV-012");

    await waitFor(() => {
      expect(screen.getByText("NV-012")).toBeInTheDocument();
      expect(screen.queryByText("NV-001")).not.toBeInTheDocument();
    });
  });

  it("moves items back to source", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function Demo() {
      const [targetKeys, setTargetKeys] = React.useState<string[]>(["user-1"]);
      return (
        <Transfer
          dataSource={TRANSFER_MOCK}
          targetKeys={targetKeys}
          onValueChange={(next, direction, moveKeys) => {
            setTargetKeys(next);
            onChange(next, direction, moveKeys);
          }}
        />
      );
    }

    renderWithUi(<Demo />);
    await user.click(screen.getByText("NV-001"));
    await user.click(screen.getByRole("button", { name: /chuyển về nguồn/i }));

    expect(onChange).toHaveBeenCalledWith([], "left", ["user-1"]);
  });

  it("selects all enabled items in a panel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithUi(
      <Transfer dataSource={TRANSFER_MOCK} targetKeys={[]} onValueChange={onChange} showSearch />,
    );

    const selectAll = screen.getAllByRole("checkbox", { name: /chọn tất cả ở nguồn/i })[0];
    await user.click(selectAll);
    await user.click(screen.getByRole("button", { name: /chuyển sang đích/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining(TRANSFER_MOCK.map((item) => item.key)),
      "right",
      expect.any(Array),
    );
  });
});
