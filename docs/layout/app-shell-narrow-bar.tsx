import { useState } from "react";
import { AppShell, Flex, PageContainer, Sidebar, Topbar, TopbarItem } from "@godxjp/ui/layout";
import type { SidebarSectionProp } from "@godxjp/ui/layout";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";

/**
 * AppShell · 390px の細いバー — ブランドの縮退と Topbar の溢れ契約（gh#728）。
 *
 * 再現している形: 6:1 のロゴロックアップ（`--logo-size-sm` で 144x24）+ start 1 セル +
 * end 4 セル + ユーザーセル + AppShell 自身のドロワートリガー。27.8.0 ではこの組み合わせが
 * 390px で破綻していた — brand はどの幅でも 143.7px のまま、`.ui-topbar-start` は width 0、
 * end の最後のセルは x=384.8 w=132.3 で viewport の外に描かれていた。
 *
 * ここで見える契約は 2 つ:
 *   1. `logoCompact` — 狭いバーで `logo` の代わりに描かれる別ノード。別ノードなので `viewBox`
 *      ごと差し替えられる（stylesheet では属性を書き換えられない）。渡さなくても brand セル
 *      自体が縮むようになった（`--app-shell-brand-max-inline-size`）。
 *   2. `Topbar overflow="scroll"`（既定）— 足りなくなったらセルを切り落とさず、バー自身が
 *      インライン方向にスクロールする。セルは DOM に残るので Tab で到達でき、フォーカスが
 *      当たったセルはブラウザが可視域へ全体を送り込む。
 */
const SECTIONS: SidebarSectionProp[] = [
  {
    label: "業務",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "tasks", label: "タスク", icon: ClipboardList },
      { id: "docs", label: "ドキュメント", icon: FileText },
      { id: "members", label: "メンバー", icon: Users },
    ],
  },
];

/** 6:1 のロックアップ — design が実物の logotype を渡してくる形そのまま（inline `<svg>`）。 */
function BrandLockup() {
  return (
    <svg
      data-demo-brand="full"
      viewBox="0 0 144 24"
      role="img"
      aria-label="ゴードエックス ワークスペース"
      style={{ blockSize: "var(--logo-size-sm)", inlineSize: "auto" }}
    >
      <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.18" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <text x="32" y="17" fontSize="14" fontWeight="600" fill="currentColor">
        GoDX Workspace
      </text>
    </svg>
  );
}

/** 同じブランドの「マークだけ」— viewBox が違うので stylesheet では作れないノード。 */
function BrandMark() {
  return (
    <svg
      data-demo-brand="compact"
      viewBox="0 0 24 24"
      role="img"
      aria-label="ゴードエックス ワークスペース"
      style={{ blockSize: "var(--logo-size-sm)", inlineSize: "auto" }}
    >
      <rect width="24" height="24" rx="6" fill="currentColor" opacity="0.18" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Demo() {
  const [activeId, setActiveId] = useState("dashboard");
  const [compactBrand, setCompactBrand] = useState(true);
  const [unread, setUnread] = useState(7);

  const end = (
    <>
      <TopbarItem aria-label="検索" icon={<Search aria-hidden="true" />} />
      <TopbarItem aria-label="予定" icon={<CalendarDays aria-hidden="true" />} />
      <TopbarItem aria-label="メッセージ" icon={<MessageSquare aria-hidden="true" />} />
      <TopbarItem
        aria-label={`通知 ${String(unread)} 件`}
        badge={unread === 0 ? undefined : unread}
        badgeTone="destructive"
        icon={<Bell aria-hidden="true" />}
        onClick={() => setUnread(0)}
      />
      <TopbarItem aria-label="アカウント">
        <Avatar className="size-7">
          <AvatarFallback>佐藤</AvatarFallback>
        </Avatar>
      </TopbarItem>
    </>
  );

  return (
    <AppShell
      topbarSpan="full"
      logo={<BrandLockup />}
      logoCompact={compactBrand ? <BrandMark /> : undefined}
      sidebar={<Sidebar activeId={activeId} onSelect={setActiveId} sections={SECTIONS} />}
      topbar={
        <Topbar
          start={
            <TopbarItem
              aria-label="統括"
              icon={<LayoutDashboard aria-hidden="true" />}
              labelHideBelow="md"
            >
              統括
            </TopbarItem>
          }
          end={end}
        />
      }
    >
      <PageContainer
        title="390px の細いバー"
        subtitle="brand の縮退 · Topbar の溢れ契約（gh#728）"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "390px の細いバー" }]}
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle level={2}>ブランドセルは狭いバーで席を譲る</CardTitle>
              <CardDescription>
                `logoCompact` を渡すと、`logoCompactBelow`（既定 `sm`）の段より下でそのノードが
                `logo` の代わりに描かれる。 渡さない場合でも brand セルは sm 未満で
                `--app-shell-brand-compact-max-inline-size`（＝バーの高さ）まで詰められ、 はみ出した
                分は inline-end 側から落ちる。27.8.0 のように 143.7px
                のまま居座ることはもうない。ボタンで両方を比べられる。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex align="center" gap="md" wrap>
                <Button
                  size="sm"
                  variant="outline"
                  aria-pressed={compactBrand}
                  onClick={() => setCompactBrand((value) => !value)}
                >
                  <Settings />
                  logoCompact: {compactBrand ? "あり" : "なし（既定の縮退のみ）"}
                </Button>
                <Badge tone={compactBrand ? "success" : "info"} icon={null}>
                  {compactBrand ? "マークだけの viewBox に差し替え" : "6:1 ロックアップを縮小"}
                </Badge>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>溢れたクラスタは切り落とさずスクロールする</CardTitle>
              <CardDescription>
                `Topbar overflow="scroll"`（既定）。320px ではこのバーはまだ 44px
                足りない。足りない分は start だけに押し付けられず（end も `flex: 0 1 auto`
                になった）、残りは バー自身が横スクロールで引き受ける — start はセル 1
                つ分の下限を、end はセルの実寸を保つので、 セルが「半分だけ描かれる」ことはない。
                `display: none` にもならないので Tab
                で到達でき、フォーカスの当たったセルはブラウザが可視域へ全体を送り込む。
                `overflow="clip"` で 27.8.0 以前の切り落としに戻せる。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="text-sm">
                {[
                  { prop: "start", desc: "統括セル（md 未満はアイコンのみ · 名前は残る）" },
                  { prop: "end", desc: "検索 / 予定 / メッセージ / 通知 + アカウント" },
                  { prop: "overflow", desc: '"scroll"（既定）| "clip"' },
                ].map(({ prop, desc }) => (
                  <Flex key={prop} align="start" gap="sm">
                    <Badge variant="secondary" className="shrink-0">
                      {prop}
                    </Badge>
                    <Text tone="muted">{desc}</Text>
                  </Flex>
                ))}
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
