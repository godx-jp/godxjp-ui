import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Badge } from "../badge";

describe("Badge — custom (unmapped) status", () => {
  it("renders an unknown status string verbatim with the neutral fallback", () => {
    // "vip" is not a key of STATUS_MAP → the `status in STATUS_MAP ? t() : status`
    // ternary takes its `: status` branch and shows the raw string.
    renderWithUi(<Badge status="vip" />);
    expect(screen.getByText("vip")).toBeInTheDocument();
  });
});
