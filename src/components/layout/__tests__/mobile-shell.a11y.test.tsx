import { describe, it } from "vitest";

import { MobileShell } from "../mobile-shell";
import { Button, Heading, Text } from "../../general";
import { Flex } from "../flex";
import { expectNoA11yViolations } from "@/test/a11y";

// MobileShell is a layout shell — a11y lives in the landmark structure (banner / main / navigation)
// plus the focusable scroll region. This checks the full handheld composition of
// docs/showcase/case6: status band, app bar with a text action, a scrolling list, the sticky
// primary verb and a three-destination tab bar.
describe("MobileShell a11y", () => {
  it("has no axe violations for a full handheld composition", async () => {
    await expectNoA11yViolations(
      <MobileShell
        height="fill"
        statusBar={
          <>
            <Text size="sm" tabular>
              9:41
            </Text>
            <Text size="sm" tone="muted" tabular>
              Acme Handy
            </Text>
          </>
        }
        header={
          <Flex align="center" justify="between" gap="xs" className="w-full">
            <Heading level={3} as="h1">
              Nhập kho
            </Heading>
            <Button variant="ghost" size="sm">
              Chọn
            </Button>
          </Flex>
        }
        actions={<Button className="flex-[2]">Quét / Tìm mã</Button>}
        tabBar={
          <>
            <Button variant="ghost" aria-current="page">
              Nhập kho
            </Button>
            <Button variant="ghost">Đóng gói</Button>
            <Button variant="ghost">Xuất kho</Button>
          </>
        }
      >
        <Flex direction="col" gap="md">
          <Text>Sữa rửa mặt Hada Labo</Text>
          <Text>Kem chống nắng Anessa</Text>
        </Flex>
      </MobileShell>,
    );
  });
});
