import { describe, it } from "vitest";

import { Toaster } from "../sonner";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Sonner Toaster a11y", () => {
  it("has no axe violations (toaster region)", async () => {
    await expectNoA11yViolations(<Toaster />);
  });

  it("has no axe violations (toaster with rich colors + top-center position)", async () => {
    await expectNoA11yViolations(<Toaster richColors position="top-center" />);
  });
});
