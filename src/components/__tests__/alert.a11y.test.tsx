import { describe, it } from "vitest";
import { Alert, AlertTitle, AlertDescription } from "../feedback/alert";
import type { ToneProp } from "../../props/vocabulary";
import { expectNoA11yViolations } from "@/test/a11y";

// Alerts use role="alert" (assertive) or role="status" (polite) depending on
// tone; every tone must keep a valid title/description structure for AT.
const tones: ToneProp[] = [
  "default",
  "destructive",
  "warning",
  "success",
  "info",
  "muted",
  "neutral",
];

describe("Alert a11y", () => {
  it.each(tones)("has no axe violations for tone=%s", async (tone) => {
    await expectNoA11yViolations(
      <Alert tone={tone}>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something needs your attention.</AlertDescription>
      </Alert>,
    );
  });
});
