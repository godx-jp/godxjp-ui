import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { Logo } from "../logo";
import { Text } from "../typography";

describe("Logo a11y", () => {
  it("has no axe violations as a decorative mark beside a wordmark", async () => {
    await expectNoA11yViolations(
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Logo glyph="c" />
        <Text weight="medium">CoreBooks</Text>
      </span>,
    );
  });

  it("has no axe violations as a standalone labelled mark", async () => {
    await expectNoA11yViolations(<Logo label="CoreBooks" size="lg" />);
  });

  it("has no axe violations as the GoDX mark + wordmark lockup", async () => {
    await expectNoA11yViolations(<Logo mark="godx" tone="success" wordmark="GoDX" />);
  });

  it("has no axe violations when the lockup carries an explicit accessible name", async () => {
    await expectNoA11yViolations(<Logo mark="godx" wordmark="GoDX" label="GoDX ID" size="lg" />);
  });
});
