import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("provider and query frame contracts", () => {
  it.each([
    ["docs/providers/app-provider.tsx", ["AppProvider", "AppSettingPicker"]],
    ["docs/query/data-state.tsx", ["DataState"]],
    ["docs/query/infinite-query-state.tsx", ["InfiniteQueryState"]],
    ["docs/query/mutation-feedback.tsx", ["AlertMutationFeedback"]],
    ["docs/query/prefetch-link.tsx", ["PrefetchLink"]],
  ])("directly renders public contracts in %s", (file, names) => {
    const source = read(file as string);
    for (const name of names as string[]) expect(source).toMatch(new RegExp(`<${name}(?:<|\\s|>)`));
  });

  it("keeps DataState loading, prerequisite, empty, transient and auth cases", () => {
    const source = read("docs/query/data-state.tsx");
    for (const marker of ["ds-loading", "ds-prerequisite", "データがありません", "503", "401"]) {
      expect(source).toContain(marker);
    }
  });

  it("locks infinite, mutation and prefetch journeys in executable tests", () => {
    expect(read("src/components/query/__tests__/infinite-query-state.test.tsx")).toContain(
      "load-more footer",
    );
    expect(read("src/components/query/__tests__/mutation-feedback.a11y.test.tsx")).toContain(
      "pending slot",
    );
    const prefetch = read("src/components/query/__tests__/prefetch-link-modes.test.tsx");
    expect(prefetch).toContain("hover");
    expect(prefetch).toContain("focus");
  });
});
