// Makes the vitest-axe `toHaveNoViolations` matcher visible to tsc. The runtime registration
// lives in vitest.setup.ts (expect.extend), but that file is outside tsconfig's `include: ["src"]`,
// so the type augmentation must live here, inside src/, to be picked up by typecheck.
/* eslint-disable @typescript-eslint/no-empty-object-type -- empty-extends is the canonical declaration-merging pattern */
import type { AxeMatchers } from "vitest-axe/matchers";

declare module "vitest" {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
