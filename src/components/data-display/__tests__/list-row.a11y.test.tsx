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

  // gh#225 — notification rows: unread/read, zero/one/two trailing actions, long JA/EN/VI content.
  it("has no axe violations as a notifications list (unread/read · 0–2 actions)", async () => {
    await expectNoA11yViolations(
      <Card>
        <CardHeader>
          <CardTitle>通知 Notifications</CardTitle>
        </CardHeader>
        <CardContent flush>
          <ListRow
            unread
            align="start"
            overflow="wrap"
            title="組織「グローバル・トランスフォーメーション推進本部」への招待が届いています"
            description="2026-07-30 09:12"
            trailing={
              <>
                <Button size="xs" variant="ghost">
                  既読にする
                </Button>
                <Button size="xs" variant="outline">
                  開く
                </Button>
              </>
            }
          />
          <ListRow
            unread
            align="start"
            overflow="wrap"
            title="Yêu cầu phê duyệt hợp đồng cung cấp dịch vụ vận hành hạ tầng đám mây quý III"
            description="2026-07-29 17:04"
            trailing={
              <Button size="xs" variant="outline">
                Mở
              </Button>
            }
          />
          <ListRow
            unread={false}
            align="start"
            overflow="wrap"
            title="Your monthly platform usage report for the Data Platform Division is ready"
            description="2026-07-28 08:00"
          />
        </CardContent>
      </Card>,
    );
  });

  // gh#224 — a long invitation title with TWO trailing Buttons (the SCR-115 overflow case).
  it("has no axe violations for a long invitation title with two trailing actions", async () => {
    await expectNoA11yViolations(
      <Card>
        <CardContent flush>
          <ListRow
            align="start"
            overflow="wrap"
            title="Trung tâm Điều phối Chuyển đổi số và Quản trị Dữ liệu Doanh nghiệp Toàn cầu"
            description="Người mời nguyễn.van.a@example.com · 2026-07-27"
            trailing={
              <>
                <Button size="xs" variant="ghost">
                  Từ chối
                </Button>
                <Button size="xs" variant="outline">
                  Chấp nhận
                </Button>
              </>
            }
          />
        </CardContent>
      </Card>,
    );
  });
});
