import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { MegaMenu, type MegaMenuItemProp } from "@godxjp/ui/navigation";
import { ShieldCheck, Users } from "lucide-react";

/**
 * MegaMenu — ONE panel, open, and nothing else on the page.
 *
 * A separate frame from `mega-menu.tsx` on purpose. An open panel is an OVERLAY: it is
 * `position: fixed` so that `Topbar`'s `overflow: clip` slots and `Card`'s `overflow: hidden` do
 * not clip it away, which means an always-open panel paints over whatever is beneath it. On a
 * page of demo cards that is a measurement hazard — the open panel covers the next card and every
 * sweep of that card reads the panel instead. So the open state lives here, alone, where it is
 * the subject rather than the obstruction.
 *
 * This is the edge case page: a column with an icon and a description beside a bare one, a
 * disabled row, a 71-character unbreakable identifier, and CJK beside Latin in the same column.
 */
const ITEMS: MegaMenuItemProp[] = [
  {
    key: "products",
    label: "製品",
    panel: {
      groups: [
        {
          key: "core",
          label: "コア業務",
          icon: <Users />,
          description: "毎日使う基幹アプリ。人事と給与はひとつの従業員台帳を共有します。",
          links: [
            {
              key: "hr",
              label: "人事管理 / HR",
              href: "/hr",
              icon: <Users />,
              description: "従業員台帳、異動履歴、組織図",
            },
            { key: "payroll", label: "給与計算 / Payroll", href: "/payroll" },
          ],
        },
        {
          key: "addons",
          label: "アドオン",
          links: [
            { key: "attendance", label: "勤怠管理", href: "/attendance" },
            { key: "workflow", label: "ワークフロー", href: "/workflow" },
            { key: "eol", label: "提供終了予定のモジュール", href: "/eol", disabled: true },
          ],
        },
        {
          key: "platform",
          label: "Platform",
          icon: <ShieldCheck />,
          links: [
            { key: "sso", label: "SSO / SAML", href: "/sso" },
            {
              key: "webhook",
              label: "webhookEndpointConfigurationForOutboundPayrollNotificationsV2",
              href: "/webhooks",
              description: "エンドポイント設定",
            },
          ],
        },
      ],
      footer: (
        <Text tone="muted" size="sm">
          すべての製品と価格は製品一覧ページでご覧いただけます。
        </Text>
      ),
    },
  },
  { key: "pricing", label: "料金", href: "/pricing" },
];

export default function MegaMenuPanelDoc() {
  return (
    <PageContainer
      title="MegaMenu · 開いたパネル"
      subtitle="1 つの nav、パネルは開いたまま · アイコンと説明のある列 / 素の列 / 無効な行 / 71 文字の識別子"
    >
      <Flex direction="col" gap="lg">
        <MegaMenu label="開いたパネルの例" items={ITEMS} defaultOpen="products" value="payroll" />
      </Flex>
    </PageContainer>
  );
}
