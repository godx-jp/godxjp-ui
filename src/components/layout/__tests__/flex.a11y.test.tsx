import { describe, it } from "vitest";
import { Flex } from "../flex";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

// Flex is a layout primitive; its job is to compose accessible children without
// introducing structural a11y problems. Icon/text children inside must keep names.
describe("Flex a11y", () => {
  it("has no axe violations with a real toolbar row of controls", async () => {
    await expectNoA11yViolations(
      <Flex direction="row" gap="md" align="center" justify="between">
        <h2>Đơn hàng</h2>
        <Flex direction="row" gap="sm" align="center">
          <Button variant="outline" size="sm">
            Lọc
          </Button>
          <Button size="sm">Tạo mới</Button>
        </Flex>
      </Flex>,
    );
  });
});
