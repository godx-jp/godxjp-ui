import { describe, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { expectNoA11yViolations } from "@/test/a11y";

// Tabs must wire tablist / tab / tabpanel ARIA correctly; render with a real tab
// list and matching panels so axe can validate the relationships.
describe("Tabs a11y", () => {
  it("has no axe violations with the data-driven items API", async () => {
    await expectNoA11yViolations(
      <Tabs
        defaultValue="overview"
        items={[
          { value: "overview", label: "Tổng quan", content: <p>Bảng điều khiển đơn hàng.</p> },
          { value: "shipments", label: "Lô hàng", content: <p>Danh sách lô hàng đang gom.</p> },
          {
            value: "billing",
            label: "Hóa đơn",
            content: <p>Hóa đơn chưa thanh toán.</p>,
            disabled: true,
          },
        ]}
      />,
    );
  });

  it("has no axe violations with the compound API", async () => {
    await expectNoA11yViolations(
      <Tabs defaultValue="day">
        <TabsList>
          <TabsTrigger value="day">Ngày</TabsTrigger>
          <TabsTrigger value="week">Tuần</TabsTrigger>
        </TabsList>
        <TabsContent value="day">Thống kê theo ngày.</TabsContent>
        <TabsContent value="week">Thống kê theo tuần.</TabsContent>
      </Tabs>,
    );
  });
});
