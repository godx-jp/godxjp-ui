import { describe, expectTypeOf, it } from "vitest";

import type { BadgeProps, BadgeTone } from "../index";

/**
 * `BadgeTone` was declared in badge.tsx but never re-exported from the data-display barrel, so a
 * consumer importing it by name got a tsc error and had to spell it
 * `NonNullable<BadgeProps["tone"]>` instead. Its neighbours — `ProgressTone`, `LogoTone`,
 * `CredentialRevealTone`, `ServiceLauncherStatusTone` — were all exported, so this was an omission
 * rather than a decision.
 *
 * A TYPE test, because the failure was a compile error: importing the name is the assertion, and
 * this file would not typecheck at all if the export went away again.
 */
describe("BadgeTone is part of the public type surface", () => {
  it("names the same union the tone prop accepts", () => {
    expectTypeOf<BadgeTone>().toEqualTypeOf<NonNullable<BadgeProps["tone"]>>();
  });
});
