import { describe, it } from "vitest";

import { LegalDocumentShell } from "../legal-document-shell";
import { Button, Text } from "../../general";
import { expectNoA11yViolations } from "@/test/a11y";

// A realistic SCR-005 legal screen: a Terms document with a document switcher in the rail, an
// accept action in the footer, and long JA / EN / VI section copy. This guards the parts axe CAN
// see — the article/nav/section landmark structure, the named contents nav, the real anchors and
// their aria-current, the heading order (h1 → h2), and the accessible names of both slots.
describe("LegalDocumentShell a11y", () => {
  it("has no axe violations for a legal terms screen with a contents rail", async () => {
    await expectNoA11yViolations(
      <LegalDocumentShell
        title="利用規約"
        version="2.4"
        effectiveDate="2026-04-01"
        summary="本規約は、当社が提供するサービスの利用条件を定めるものです。"
        contentsLabel="目次"
        documentNavigation={
          <nav aria-label="法的文書">
            <a href="/legal/terms">利用規約</a>
          </nav>
        }
        footerAction={<Button size="sm">同意する</Button>}
        sections={[
          {
            id: "acceptance",
            title: "第1条(適用)",
            content: (
              <Text as="p">
                本規約は、利用者と当社との間のサービスの利用に関わる一切の関係に適用されるものとします。
              </Text>
            ),
          },
          {
            id: "data-retention",
            title: "2. Data retention and cross-border transfers",
            content: (
              <Text as="p">
                We retain transaction records for seven years in accordance with applicable
                accounting and anti-money-laundering legislation.
              </Text>
            ),
          },
          {
            id: "quyen-rieng-tu",
            title: "3. Quyền riêng tư của người dùng",
            content: (
              <Text as="p">
                Chúng tôi chỉ thu thập những thông tin cần thiết để cung cấp dịch vụ và không chia
                sẻ dữ liệu cá nhân với bên thứ ba khi chưa có sự đồng ý của bạn.
              </Text>
            ),
          },
        ]}
      />,
    );
  });

  it("has no axe violations in the controlled form with an active section", async () => {
    await expectNoA11yViolations(
      <LegalDocumentShell
        title="Privacy Policy"
        contentsLabel="On this page"
        activeSection="cookies"
        onActiveSectionChange={() => {}}
        sections={[
          {
            id: "collection",
            title: "1. What we collect",
            content: <Text as="p">Account data.</Text>,
          },
          {
            id: "cookies",
            title: "2. Cookies",
            content: <Text as="p">Strictly necessary only.</Text>,
          },
        ]}
      />,
    );
  });
});
