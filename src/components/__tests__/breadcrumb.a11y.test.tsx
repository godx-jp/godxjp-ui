import { describe, it } from "vitest";
import { Breadcrumb } from "../layout/breadcrumb";
import type { BreadcrumbProp } from "../../props/vocabulary/navigation.prop";
import { expectNoA11yViolations } from "@/test/a11y";

// Breadcrumbs are a labeled nav landmark; intermediate links must be reachable
// and the current (last) segment must not be a dead link.
const items: BreadcrumbProp = [
  { label: "Home", to: "/" },
  { label: "Reports", to: "/reports" },
  { label: "Q2 Summary" },
];

describe("Breadcrumb a11y", () => {
  it("has no axe violations for a multi-segment trail", async () => {
    await expectNoA11yViolations(<Breadcrumb items={items} />);
  });
});
