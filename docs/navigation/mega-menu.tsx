import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { MegaMenu, type MegaMenuItemProp } from "@godxjp/ui/navigation";
import {
  BookOpen,
  Building2,
  Calculator,
  CreditCard,
  FileText,
  LifeBuoy,
  ShieldCheck,
  Users,
} from "lucide-react";

/**
 * MegaMenu — the primary site navigation whose top-level items disclose a full-width panel.
 *
 * WAI-ARIA APG **Disclosure Navigation with Top-Level Links**, not Menubar: a bar of links to
 * PLACES is not a menu of COMMANDS, and `role="menu"` would promise assistive technology an
 * application menu. That is also why this is not `DropdownMenu` plus a token — `DropdownMenu` is
 * `role="menu"` by construction.
 *
 * The cards below are deliberately NOT tidy. Each one is an edge a real site hits on day one and a
 * demo page usually hides: a panel with forty links beside a panel with one, a 71-character
 * unbreakable label, CJK beside Latin, a group carrying an icon and a description beside a bare
 * column, and the narrow layout where the panel has nowhere to go.
 */

/** Forty links, which is the size at which a panel stops being a list and starts being a screen. */
const FORTY = Array.from({ length: 40 }, (_, index) => ({
  key: `report-${index + 1}`,
  label: `レポート ${String(index + 1).padStart(2, "0")}`,
  href: `/reports/${index + 1}`,
}));

/** The bar every other card varies. CJK labels beside Latin ones, on purpose. */
const ITEMS: MegaMenuItemProp[] = [
  {
    key: "products",
    label: "製品",
    icon: <Building2 />,
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
            {
              key: "payroll",
              label: "給与計算 / Payroll",
              href: "/payroll",
              icon: <Calculator />,
              description: "月次締め、賞与、年末調整",
            },
            {
              key: "expense",
              label: "経費精算 / Expenses",
              href: "/expense",
              icon: <CreditCard />,
              description: "申請から振込まで",
            },
          ],
        },
        {
          // A BARE column beside the decorated one above: no icon, no description, no heading
          // beyond the label. Both shapes have to look deliberate side by side.
          key: "addons",
          label: "アドオン",
          links: [
            { key: "attendance", label: "勤怠管理", href: "/attendance" },
            { key: "workflow", label: "ワークフロー", href: "/workflow" },
            { key: "mynumber", label: "マイナンバー管理", href: "/mynumber" },
            { key: "eol", label: "提供終了予定のモジュール", href: "/eol", disabled: true },
          ],
        },
        {
          key: "platform",
          label: "Platform",
          icon: <ShieldCheck />,
          links: [
            { key: "sso", label: "SSO / SAML", href: "/sso" },
            { key: "audit", label: "Audit log", href: "/audit" },
            {
              // 71 characters, no space, no hyphen — a real webhook identifier pasted into a nav.
              // It must WRAP inside its column, never widen the panel past the viewport.
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
  {
    key: "reports",
    label: "レポート",
    icon: <FileText />,
    panel: {
      groups: [
        { key: "all", label: "標準レポート (40)", links: FORTY.slice(0, 20) },
        { key: "more", label: "続き", links: FORTY.slice(20) },
      ],
    },
  },
  {
    key: "support",
    label: "Support",
    icon: <LifeBuoy />,
    panel: {
      // ONE link. The narrowest panel a consumer will ever build, and it must not look broken
      // beside the forty-link one above.
      groups: [
        {
          key: "contact",
          label: "お問い合わせ",
          links: [{ key: "contact-us", label: "サポートに連絡する", href: "/support" }],
        },
      ],
    },
  },
  { key: "docs", label: "ドキュメント", href: "/docs", icon: <BookOpen /> },
  { key: "pricing", label: "料金", href: "/pricing" },
];

export default function MegaMenuDoc() {
  const [route, setRoute] = useState("payroll");

  return (
    <PageContainer
      title="MegaMenu"
      subtitle="APG Disclosure Navigation · 全幅パネル · roving tabindex · hover intent · 狭い画面ではアコーディオン"
    >
      <Flex direction="col" gap="lg">
        {/* 1 · IN A REAL BAR — the component where it actually lives. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>サイトのヘッダー · ロゴの隣に置く</CardTitle>
            <CardDescription>
              バーのふるまい（roving tabindex・aria-expanded・Escape で戻る）はすべて `MegaMenu`
              が持ちます。現在のルートは `value` で渡し、`aria-current=&quot;page&quot;`
              としてバーとパネルの両方に出ます。
              <br />
              `Topbar` のスロットには入れないでください。実測した理由が 2
              つあります。`topbar-center` は約 1280px 未満で `display: none` になるのでノート PC
              の幅でナビゲーションごと消え、`topbar-start` は `overflow: clip` かつ `flex-wrap:
              nowrap` の 1 行なので、狭い画面で縦に開く アコーディオンが行からはみ出します（375px で
              58 要素がビューポート外）。電話幅のサイトナビは バーの中ではなく `Sheet`
              の中に置く、というのが実サイトの答えです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex align="center" gap="md">
              <Text weight="semibold">GodX</Text>
              <MegaMenu
                label="メインナビゲーション"
                items={ITEMS}
                value={route}
                onValueChange={setRoute}
              />
            </Flex>
          </CardContent>
        </Card>

        {/* 2 · THE EDGES — one link beside forty, an unbreakable token, CJK beside Latin. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>端 · 1 件のパネルと 40 件のパネル</CardTitle>
            <CardDescription>
              「レポート」は 40 件、「Support」は 1 件。40
              件のパネルは列に折り返して高さを抑え、それでも入り切らなければブロック方向にスクロールします。「Platform」列の
              71 文字の webhook
              識別子は列の中で折り返し、バーやパネルをビューポートの外へ広げません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MegaMenu label="端の例" items={ITEMS} />
          </CardContent>
        </Card>

        {/* 3 · HOVER INTENT — the mode antd defaults to, and the diagonal it has to survive. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>triggerAction=&quot;hover&quot; · 斜めに動くマウス</CardTitle>
            <CardDescription>
              Ant Design の `triggerSubMenuAction`。トリガーから離れただけでは閉じません —
              閉じるのは nav 全体からポインタが出たときだけで、それも `closeDelay`（既定 100ms、antd
              の `subMenuCloseDelay`
              と同じ）の猶予があります。だから「製品」から斜め下のリンクへ一直線に動けます。クリックでも開くので、タッチ端末で行き止まりになりません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MegaMenu label="ホバーの例" items={ITEMS} triggerAction="hover" size="sm" />
          </CardContent>
        </Card>

        {/* 4 · NARROW — the same disclosure, in flow. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>
              狭い画面 · 同じ disclosure がそのままアコーディオンになる
            </CardTitle>
            <CardDescription>
              全幅パネルは 375px では行き場がありません。768px
              未満ではバーが縦に積み、パネルは自分のトリガーの真下にインフローで開きます。DOM もARIA
              も同じ（`aria-expanded` / `aria-controls`）で、Escape もそのまま効きます。Menubar
              ではなく Disclosure を選んだ配当がこれです。ブラウザを 768px
              より狭くして確かめてください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MegaMenu label="狭い画面の例" items={ITEMS} size="lg" />
          </CardContent>
        </Card>

        {/* 5 · WHAT IT IS NOT. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>これは DropdownMenu ではない</CardTitle>
            <CardDescription>
              `DropdownMenu` は `role=&quot;menu&quot;` /
              `role=&quot;menuitem&quot;`（コマンドのメニュー）です。リンクの集まりにこれを使うと、スクリーンリーダーはアプリケーションメニューとして読み上げ、Tab
              はウィジェット全体から出てしまいます。これがメガメニューの典型的な a11y
              欠陥で、このコンポーネントが存在する理由です。操作（削除・名前の変更）には
              `DropdownMenu`、場所への移動には `MegaMenu` を使ってください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text tone="muted" size="sm">
              現在のルート: {route}
            </Text>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
