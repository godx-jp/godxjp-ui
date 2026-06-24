import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { Logo, Text } from "../../general";

describe("Logo a11y", () => {
  it("has no violations as a labelled mark (accessible name)", async () => {
    await expectNoA11yViolations(<Logo label="GoDX" size="lg" />);
  });

  it("has no violations as a decorative mark beside a wordmark", async () => {
    await expectNoA11yViolations(
      <span className="inline-flex items-center gap-2">
        <Logo />
        <Text weight="bold">GoDX</Text>
      </span>,
    );
  });
});
