import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { Card, CardContent, CardHeader, CardTitle, ListRow, Badge } from "..";
import { Button } from "../../general/button";

describe("ListRow a11y", () => {
  it("has no axe violations as a list of rows inside a Card", async () => {
    await expectNoA11yViolations(
      <Card>
        <CardHeader>
          <CardTitle>アクティブなセッション</CardTitle>
        </CardHeader>
        <CardContent flush>
          <ListRow
            title="iPhone 15 · Tokyo"
            description="最終アクセス 2分前"
            trailing={<Badge status="active" />}
          />
          <ListRow
            title="MacBook Pro · Osaka"
            description="最終アクセス 3日前"
            trailing={
              <Button size="xs" variant="outline">
                ログアウト
              </Button>
            }
          />
        </CardContent>
      </Card>,
    );
  });
});
