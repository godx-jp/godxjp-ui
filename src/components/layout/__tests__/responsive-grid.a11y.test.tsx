import { describe, it } from "vitest";
import { ResponsiveGrid } from "../responsive-grid";
import { Card, CardContent, CardHeader, CardTitle } from "../../data-display/card";
import { expectNoA11yViolations } from "@/test/a11y";

// ResponsiveGrid lays out repeated cards; verify a realistic card grid stays
// accessible (no orphaned regions, headings keep their structure).
describe("ResponsiveGrid a11y", () => {
  it("has no axe violations with a grid of summary cards", async () => {
    await expectNoA11yViolations(
      <ResponsiveGrid columns={3}>
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu</CardTitle>
          </CardHeader>
          <CardContent>¥1,240,000</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>312</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Khách hàng</CardTitle>
          </CardHeader>
          <CardContent>87</CardContent>
        </Card>
      </ResponsiveGrid>,
    );
  });
});
