/**
 * gh#1041 — Cascader had the same never-cleared `requestedLoads` ledger as Tree. rc-cascader keeps
 * no "loaded" ledger at all, so a failed branch is asked for again on its next activation; ours
 * keeps the once-per-SUCCESS dedupe and forgets a rejection.
 */
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Cascader } from "../cascader";

describe("Cascader — a rejected loadData can be retried (gh#1041)", () => {
  it("re-asks on the next activation after a rejection, and never after a success", async () => {
    const user = userEvent.setup();
    const loadData = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(undefined);
    renderWithUi(
      <Cascader
        options={[{ value: "tokyo", label: "東京", isLeaf: false }]}
        aria-label="地域"
        loadData={loadData}
        onValueChange={() => {}}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /東京/ }));
    expect(loadData).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("option", { name: /東京/ }));
    expect(loadData, "the retry must reach loadData").toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("option", { name: /東京/ }));
    expect(loadData).toHaveBeenCalledTimes(2);
  });
});
