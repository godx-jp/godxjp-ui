import { describe, expect, it } from "vitest";

import { DialogContent } from "../../feedback/dialog";
import { SheetContent } from "../../feedback/sheet";
import { Flex } from "../../layout/flex";
import { Form, FormField, Input } from "..";
import type { WidthProp } from "../../../props";

/*
 * gh#1431 — TYPE contract: `WidthProp` is a CSS length, not a size tier. `controlWidth="md"` used to
 * compile (the type was `number | string`) and was written into CSS as `--form-control-width: md`,
 * which is invalid, so the Select spanned the whole column (1760px of a 1920px viewport, the same
 * as no controlWidth at all). A bare word is now a compile error on every `WidthProp` prop.
 *
 * Checked by `pnpm typecheck` (tsconfig includes `src/**`): a regression is a compile error below —
 * the `@ts-expect-error` lines fail the build if a bare word ever type-checks again.
 */

describe("WidthProp accepts CSS lengths and rejects size-tier words (gh#1431)", () => {
  it("accepts numbers, unit lengths, percentages, intrinsic keywords and math expressions", () => {
    const accepted: WidthProp[] = [
      320,
      "20rem",
      "1.5em",
      "100%",
      "40ch",
      "90vw",
      "50cqi",
      "auto",
      "max-content",
      "min-content",
      "fit-content",
      "calc(100% - 2rem)",
      "min(20rem, 50vw)",
      "max(10rem, 30%)",
      "clamp(10rem, 40vw, 30rem)",
      "var(--form-control-width)",
      "fit-content(20rem)",
    ];
    expect(accepted).toHaveLength(17);
  });

  it("rejects a size-tier word on every WidthProp prop", () => {
    const element = (
      <>
        {/* @ts-expect-error — "md" is a size tier, not a CSS length */}
        <Form controlWidth="md" />
        {/* @ts-expect-error — "md" is a size tier, not a CSS length */}
        <Form labelWidth="md" />
        <Form>
          {/* @ts-expect-error — "lg" is a size tier, not a CSS length */}
          <FormField id="a" label="A" controlWidth="lg">
            <Input id="a" />
          </FormField>
          {/* @ts-expect-error — "sm" is a size tier, not a CSS length */}
          <FormField id="b" label="B" labelWidth="sm">
            <Input id="b" />
          </FormField>
        </Form>
        {/* @ts-expect-error — a unitless number string is not a CSS length */}
        <Flex width="320" />
        {/* @ts-expect-error — "lg" is a size tier, not a CSS length */}
        <SheetContent width="lg" />
        {/* @ts-expect-error — "md" is a size tier, not a CSS length */}
        <DialogContent width="md" />
      </>
    );
    expect(element).toBeTruthy();
  });
});
