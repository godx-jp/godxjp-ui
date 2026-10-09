import { describe, expect, it } from "vitest";
// Self-test for `check:mcp-guidance` (v32 #1223): each rule fires on the defect class R4 measured
// in the shipped catalog, and stays quiet on the honest spelling of the same thing.
import { discardedProps, lintGuidance } from "../../scripts/check-mcp-guidance.mjs";

type Entry = {
  name: string;
  tagline: string;
  props: Array<{ name: string; description: string }>;
  related?: string[];
  useCases?: string[];
  subParts?: string[];
  absorbed?: string[];
  storyPath?: string;
  importPath?: string;
};

const entry = (over: Partial<Entry> & { name: string }): Entry => ({
  tagline: "A component.",
  props: [],
  ...over,
});

const run = (components: Entry[], extra: Partial<Parameters<typeof lintGuidance>[0]> = {}) =>
  lintGuidance({
    components,
    utilities: [{ name: "cn" }],
    runtimeDeps: new Set(["react-aria-components", "cmdk"]),
    docExists: (rel: string) => rel === "general/button.tsx",
    ...extra,
  });

const BASE = [
  entry({ name: "Select", absorbed: ["Combobox", "LocalePicker"], subParts: ["SelectItem"] }),
  entry({ name: "AppSettingPicker" }),
];

describe("check:mcp-guidance", () => {
  it("related: a leading name that is not shipped — including an absorbed one — is a finding", () => {
    const found = run([
      ...BASE,
      entry({
        name: "AppProvider",
        related: [
          "LocalePicker — pick the locale.", // absorbed: does not exist
          "MonthPicker — pick a month.", // never existed
          "AppSettingPicker — the real one.",
          "SelectItem — a sub-part is a real export.",
        ],
      }),
    ]);
    expect(found.map((f) => [f.rule, f.detail.split(" ")[0]])).toEqual([
      ["related", "LocalePicker"],
      ["related", "MonthPicker"],
    ]);
  });

  it("related: steering AWAY from an absorbed name is the point of `absorbed`, not a defect", () => {
    expect(
      run([
        ...BASE,
        entry({ name: "X", related: ["Combobox — there is no Combobox; use Select."] }),
      ]),
    ).toEqual([]);
  });

  it("useCases: a shown component that does not exist is a finding; prose words are not", () => {
    const found = run([
      ...BASE,
      entry({
        name: "Form",
        useCases: [
          "Pick a country with a `MultiSelect` beside a <TreeList items={…} />.",
          "TanStack Query keeps the ReactNode cached; `StepStatusProp` is a type.",
          "<Select showSearch> covers it.",
        ],
      }),
    ]);
    expect(found.map((f) => f.detail)).toEqual(["MultiSelect", "TreeList"]);
  });

  it("storyPath: a page that is not under docs/ is a finding; an omitted storyPath is not", () => {
    const found = run([
      entry({ name: "Button", storyPath: "general/button.tsx" }),
      entry({ name: "Card", storyPath: "data-display/Card.stories.tsx" }),
      entry({ name: "Text" }),
    ]);
    expect(found).toEqual([
      { rule: "storyPath", entry: "Card", detail: "docs/data-display/Card.stories.tsx" },
    ]);
  });

  it("tagline: naming a library the package does not depend on is a finding", () => {
    const found = run([
      entry({ name: "Tooltip", tagline: "Radix-backed tooltip." }),
      entry({ name: "Command", tagline: "cmdk-backed command list." }),
      entry({ name: "Popover", tagline: "React Aria positioned panel." }),
    ]);
    expect(found).toEqual([{ rule: "tagline", entry: "Tooltip", detail: String(/\bRadix\b/i) }]);
  });

  it("tagline: a sibling-package entry is judged against THAT package's dependencies", () => {
    const found = run(
      [
        entry({
          name: "BlockEditor",
          importPath: "@godxjp/block-editor",
          tagline: "Tiptap editor.",
        }),
      ],
      { packageDeps: { "@godxjp/block-editor": new Set(["@tiptap/core"]) } },
    );
    expect(found).toEqual([]);
  });

  it("inert: a documented prop the implementation discards must say so", () => {
    const discarded = new Map([["Tooltip", new Set(["disableHoverableContent", "sticky"])]]);
    const found = run(
      [
        entry({
          name: "Tooltip",
          props: [
            { name: "disableHoverableContent", description: "Closes when the pointer leaves." },
            { name: "sticky", description: "No effect on the React Aria base." },
          ],
        }),
      ],
      { discarded },
    );
    expect(found).toEqual([{ rule: "inert", entry: "Tooltip", detail: "disableHoverableContent" }]);
  });

  it("discardedProps reads `prop: _prop` destructuring, and nothing else", () => {
    const src = `function T({ open, disableHoverableContent: _disableHoverableContent, side: s, _x }) {}`;
    expect([...discardedProps(src)]).toEqual(["disableHoverableContent"]);
  });
});
