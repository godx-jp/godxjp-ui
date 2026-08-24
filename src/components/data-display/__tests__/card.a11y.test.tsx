import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

// Cards are composition shells; the title must be a real heading and any
// actions must carry accessible names.
describe("Card a11y", () => {
  it("defaults to an h3 section heading and supports explicit levels", () => {
    // Default level is 3 (a card nested under an already-h2 section) per #169; a card sitting
    // directly under the page h1 opts up to level={2} to keep the outline gap-free.
    const { rerender } = render(<CardTitle>Primary section</CardTitle>);
    expect(screen.getByRole("heading", { level: 3, name: "Primary section" })).toBeInTheDocument();
    rerender(<CardTitle level={2}>Nested section</CardTitle>);
    expect(screen.getByRole("heading", { level: 2, name: "Nested section" })).toBeInTheDocument();
  });
  it("has no axe violations for a fully composed card", async () => {
    await expectNoA11yViolations(
      <Card>
        <CardHeader>
          <CardTitle>配送状況</CardTitle>
          <CardDescription>本日の出荷概要</CardDescription>
        </CardHeader>
        <CardContent>
          <p>3 件の荷物が配送中です。</p>
        </CardContent>
        <CardFooter separated>
          <Button type="button">詳細を見る</Button>
        </CardFooter>
      </Card>,
    );
  });

  it("has no axe violations for an accented compact card", async () => {
    await expectNoA11yViolations(
      <Card accent="success" variant="outline">
        <CardContent solo>
          <p>処理が正常に完了しました。</p>
        </CardContent>
      </Card>,
    );
  });
});
