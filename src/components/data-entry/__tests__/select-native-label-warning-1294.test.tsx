import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithUi } from "@/test/render";

import { Select } from "../select";

/**
 * A Select named by a visible `<label htmlFor>` (gh#1283) must not make react-aria's root warn
 * "If you do not provide a visible label…" on every render: 32.4.1 dropped the placeholder name
 * from the root without handing it the label instead (found on the gh#1294 list exemplar: 12
 * warnings for one FilterBar).
 */
afterEach(() => vi.restoreAllMocks());

const OPTIONS = [{ value: "a", label: "A" }];
const missingLabelWarnings = (warn: ReturnType<typeof vi.spyOn>) =>
  warn.mock.calls.filter(([m]) => String(m).includes("visible label")).length;

describe("Select labelled by <label for> (gh#1294)", () => {
  it("does not trigger react-aria's missing-label warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithUi(
      <>
        <label htmlFor="region">Region</label>
        <Select id="region" options={OPTIONS} placeholder="Any region" />
      </>,
    );
    expect(missingLabelWarnings(warn)).toBe(0);
  });

  it("control: an unlabelled Select without a placeholder still warns (the lens works)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithUi(<Select id="bare" options={OPTIONS} />);
    expect(missingLabelWarnings(warn)).toBeGreaterThan(0);
  });
});
