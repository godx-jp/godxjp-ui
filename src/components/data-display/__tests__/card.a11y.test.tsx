import { describe, it } from "vitest";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

// Cards are composition shells; the title must be a real heading and any
// actions must carry accessible names.
describe("Card a11y", () => {
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
      <Card size="compact" accent="success" variant="outline">
        <CardContent solo>
          <p>処理が正常に完了しました。</p>
        </CardContent>
      </Card>,
    );
  });
});
