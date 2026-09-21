import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  KeyRound,
  Languages,
  Mail,
  Plug,
  Receipt,
  ScrollText,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
  EmptyState,
  ScrollArea,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  Flex,
  MasterDetail,
  NavList,
  PageContainer,
  type SidebarItemProp,
} from "@godxjp/ui/layout";

/**
 * NavList · ページ内のルート遷移ナビゲーション。
 *
 * 設定画面のナビは、どの案件でも作る形なのに、primitive がないと毎回 Button を並べて自作されます。
 * そこで失われるのは aria-current="page"、アイコン列へのラベル揃え、そして 32px 行の幾何です。
 * このページは「設定ナビ」を正準形として最初に置き、その周りに grouped / flat、行末スロット、
 * 状態、極端なラベル、長い一覧、空、狭い幅を並べます。
 *
 * グループは item.children です（gh#815）。レールと同じ .sb-nav-group を描き、ランドマークは
 * ページに 1 つのままです。子行はレールの入れ子行と同じくドットマーカーになるので、子の icon は
 * 描かれません（同じ項目をフラットに並べたときは描かれます）。
 *
 * 今日の NavList でできないこと（ページ内に明記してあります）:
 * - 行そのものの tone がない。破壊的な操作はペイン側の Button variant="destructive" に置きます。
 */

const SETTINGS_NAV: SidebarItemProp[] = [
  {
    id: "account",
    label: "アカウント",
    icon: User,
    children: [
      { id: "profile", label: "プロフィール", icon: User },
      { id: "organization", label: "組織情報", icon: Building2 },
      { id: "locale", label: "言語と地域", icon: Languages },
    ],
  },
  {
    id: "security",
    label: "セキュリティ",
    icon: ShieldCheck,
    children: [
      { id: "password", label: "パスワード", icon: KeyRound },
      {
        id: "two-factor",
        label: "二要素認証",
        icon: Smartphone,
        badge: "未設定",
        badgeTone: "destructive",
      },
      { id: "sessions", label: "サインイン履歴", icon: Globe, badge: "4" },
      { id: "audit", label: "監査ログ", icon: ScrollText },
    ],
  },
  {
    id: "notifications",
    label: "通知",
    icon: Bell,
    children: [
      { id: "mail", label: "メール通知", icon: Mail, badge: "8" },
      { id: "desktop", label: "デスクトップ通知", icon: Bell, badge: "新着" },
    ],
  },
  {
    id: "billing",
    label: "請求",
    icon: CreditCard,
    children: [
      { id: "plan", label: "契約プラン", icon: BadgeCheck },
      { id: "payment", label: "支払い方法", icon: CreditCard },
      { id: "invoices", label: "請求書", icon: Receipt, badge: "3" },
    ],
  },
];

const FLAT_ITEMS: SidebarItemProp[] = SETTINGS_NAV.flatMap((group) => group.children ?? []);

type Pane = { title: string; description: string; facts: [string, string][] };

const PANES: Record<string, Pane> = {
  profile: {
    title: "プロフィール",
    description: "社内ディレクトリと監査ログに表示される名前です。",
    facts: [
      ["表示名", "佐藤 智"],
      ["メールアドレス", "sato.satoshi@example.co.jp"],
    ],
  },
  organization: {
    title: "組織情報",
    description: "請求書と契約書に印字される法人情報です。",
    facts: [
      ["法人名", "株式会社エグザンプル"],
      ["法人番号", "5010001000001"],
    ],
  },
  locale: {
    title: "言語と地域",
    description: "日付・数値・通貨の表示は BCP-47 と IANA タイムゾーンから決まります。",
    facts: [
      ["表示言語", "日本語 (ja-JP)"],
      ["タイムゾーン", "Asia/Tokyo"],
    ],
  },
  password: {
    title: "パスワード",
    description: "90 日ごとの変更が組織ポリシーで required になっています。",
    facts: [
      ["最終変更", "2026-06-12"],
      ["次回の期限", "2026-09-10"],
    ],
  },
  "two-factor": {
    title: "二要素認証",
    description: "未設定のままだと 2026-10-01 以降サインインできなくなります。",
    facts: [
      ["状態", "未設定"],
      ["猶予期限", "2026-09-30"],
    ],
  },
  sessions: {
    title: "サインイン履歴",
    description: "現在有効なセッションは 4 件です。心当たりがなければ失効させてください。",
    facts: [
      ["直近のサインイン", "2026-09-21 09:14 JST"],
      ["直近の IP", "203.0.113.42"],
    ],
  },
  audit: {
    title: "監査ログ",
    description: "保持期間は契約プランに連動します。エクスポートは CSV と JSON Lines。",
    facts: [
      ["保持期間", "400 日"],
      ["直近のエクスポート", "2026-09-01"],
    ],
  },
  mail: {
    title: "メール通知",
    description: "8 種類の通知が有効です。ダイジェストは毎営業日 08:00 に届きます。",
    facts: [
      ["配信先", "sato.satoshi@example.co.jp"],
      ["ダイジェスト", "毎営業日 08:00 JST"],
    ],
  },
  desktop: {
    title: "デスクトップ通知",
    description: "ブラウザの許可が必要です。承認待ちのみ即時、それ以外はまとめて通知します。",
    facts: [
      ["ブラウザ許可", "許可済み"],
      ["即時通知", "承認待ちのみ"],
    ],
  },
  plan: {
    title: "契約プラン",
    description: "座席数は月末締めで日割り計算されます。",
    facts: [
      ["プラン", "Enterprise"],
      ["座席数", "240 / 250"],
    ],
  },
  payment: {
    title: "支払い方法",
    description: "請求書払い（銀行振込）です。支払サイトは月末締め翌月末払い。",
    facts: [
      ["支払方法", "銀行振込"],
      ["支払サイト", "月末締め翌月末払い"],
    ],
  },
  invoices: {
    title: "請求書",
    description: "未払いが 3 件あります。最も古いものは 2026-07 分です。",
    facts: [
      ["未払い件数", "3 件"],
      ["未払い合計", "¥1,284,000"],
    ],
  },
};

const FALLBACK_PANE: Pane = {
  title: "設定",
  description: "左のナビゲーションから項目を選んでください。",
  facts: [],
};

function SettingsPane({ routeId }: { routeId: string }) {
  const pane = PANES[routeId] ?? FALLBACK_PANE;
  return (
    <Card>
      <CardHeader>
        <CardTitle level={3}>{pane.title}</CardTitle>
        <CardDescription>{pane.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Descriptions columns={2}>
          {pane.facts.map(([label, value]) => (
            <Descriptions.Item key={label} label={label}>
              {value}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </CardContent>
    </Card>
  );
}

const TRAILING_ITEMS: SidebarItemProp[] = [
  { id: "queue", label: "承認待ち", icon: FileText, badge: "12" },
  { id: "mentions", label: "自分宛のメンション", icon: Bell, badge: "3", badgeTone: "destructive" },
  { id: "release", label: "リリースノート", icon: BadgeCheck, badge: "新着" },
  { id: "integrations", label: "連携アプリ", icon: Plug, trailingIcon: ChevronRight },
  {
    id: "status",
    label: "サービス稼働状況",
    icon: Globe,
    trailingIcon: ExternalLink,
    href: "https://status.example.co.jp",
  },
];

const LABEL_STRESS_ITEMS: SidebarItemProp[] = [
  { id: "sso", label: "SSO", icon: KeyRound },
  { id: "mfa", label: "2FA", icon: Smartphone, badge: "2" },
  {
    id: "audit-export",
    label: "外部監査人への監査証跡エクスポートと保持期間の設定",
    icon: ScrollText,
  },
  {
    id: "notify-default",
    label: "組織全体の通知とメール配信の既定値を管理者があとから上書きする",
    icon: Bell,
    badge: "新着",
  },
];

const STATE_ITEMS: SidebarItemProp[] = [
  { id: "profile", label: "プロフィール", icon: User, href: "/settings/profile" },
  { id: "members", label: "メンバー管理", icon: Users, disabled: true },
  {
    id: "export",
    label: "データエクスポート",
    icon: FileText,
    href: "/settings/export",
    disabled: true,
  },
  { id: "delete", label: "アカウントを削除", icon: Trash2 },
];

/** `icon` は任意（gh#815）。無い行も空の `.sb-icon` 箱でラベル列を保ちます。 */
const MIXED_ICON_ITEMS: SidebarItemProp[] = [
  { id: "api-keys", label: "API キー", icon: KeyRound, badge: "2" },
  { id: "webhooks", label: "Webhook" },
  { id: "domains", label: "ドメイン認証", icon: Globe },
  { id: "seats", label: "座席の割り当て" },
];

const LONG_ITEMS: SidebarItemProp[] = [
  ...FLAT_ITEMS,
  { id: "api-keys", label: "API キー", icon: KeyRound, badge: "2" },
  { id: "webhooks", label: "Webhook", icon: Plug },
  { id: "domains", label: "ドメイン認証", icon: Globe, badge: "1", badgeTone: "destructive" },
  { id: "seats", label: "座席の割り当て", icon: Users },
];

export default function Demo() {
  const [route, setRoute] = useState("two-factor");
  const [flatRoute, setFlatRoute] = useState("password");
  const [groupedRoute, setGroupedRoute] = useState("password");
  const [longRoute, setLongRoute] = useState("api-keys");
  const [narrowRoute, setNarrowRoute] = useState("profile");
  const [narrowPane, setNarrowPane] = useState<"master" | "detail">("master");

  return (
    <PageContainer title="NavList" subtitle="ページ内のルート遷移ナビゲーション">
      <Card>
        <CardHeader>
          <CardTitle level={2}>設定ナビゲーション · 正準形</CardTitle>
          <CardDescription>
            これがないと、各アプリが Button を並べて設定ナビを自作し、aria-current=&quot;page&quot;
            とアイコン列が失われます。グループは item.children です。ページのナビゲーションは 1
            つなので、&lt;nav&gt; ランドマークも 1 つのまま、NavList も 1
            つです。ルートが子に当たったグループは自分で開きます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MasterDetail
            rail="master"
            railWidth="compact"
            masterLabel="設定"
            detailLabel="設定の内容"
            detailId="nav-list-settings-pane"
            master={
              <NavList label="設定" items={SETTINGS_NAV} activeId={route} onSelect={setRoute} />
            }
          >
            <SettingsPane routeId={route} />
          </MasterDetail>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>グループあり · グループなし</CardTitle>
          <CardDescription>
            これがないと、12
            項目を一列に並べた読めないナビが既定になります。グループにする方法は一つだけ（item.children）だと示しておかないと、各アプリが独自の見出しマークアップを発明します。
            どちらも NavList 1 つ、&lt;nav&gt; ランドマーク 1
            つです。子行はレールの入れ子行と同じドットマーカーになるので、子の icon
            は描かれません。左のフラット版では同じ 12 項目の icon がそのまま描かれます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction={{ base: "col", md: "row" }} gap="xl" align="start">
            <Flex direction="col" gap="sm" grow>
              <Text size="sm" weight="medium">
                フラット · 12 行 · ランドマーク 1 つ
              </Text>
              <NavList
                label="設定（フラット）"
                items={FLAT_ITEMS}
                activeId={flatRoute}
                onSelect={setFlatRoute}
              />
            </Flex>
            <Flex direction="col" gap="sm" grow>
              <Text size="sm" weight="medium">
                グループあり · 開閉 4 つ · ランドマーク 1 つ
              </Text>
              <NavList
                label="設定（グループあり）"
                items={SETTINGS_NAV}
                activeId={groupedRoute}
                onSelect={setGroupedRoute}
              />
            </Flex>
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>行の末尾に置けるもの</CardTitle>
          <CardDescription>
            これがないと、シェブロンが badge に渡されます。badge は中身を .sb-badge
            のカプセルで包むので、16px の先頭アイコンの隣に 24px の SVG
            が入った灰色の錠剤が並びます。 数と状態は badge（badgeTone=&quot;destructive&quot;
            は「自分宛」の意味）、グリフは trailingIcon。href のある行は &lt;a&gt;
            として描かれるので、中クリックも新規タブも効きます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NavList label="行末スロット" items={TRAILING_ITEMS} activeId="mentions" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>アイコン列とラベルの極端なケース</CardTitle>
          <CardDescription>
            これがないと、icon のない行は型が許さないと誤解されます。icon は任意です。無い行も空の
            .sb-icon 箱を保つので、ラベルの列は動きません。だから「2 文字のラベル」も「3
            行に折り返す日本語のラベル」も同じ列から始まり、行は縮まず、折り返すのはラベルだけです。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction={{ base: "col", md: "row" }} gap="xl" align="start">
            <Flex direction="col" gap="sm" grow>
              <Text size="sm" weight="medium">
                レール幅（compact · 18.75rem）
              </Text>
              <NavList label="ラベル長のストレス" items={LABEL_STRESS_ITEMS} activeId="mfa" />
            </Flex>
            <Flex direction="col" gap="sm" width={180}>
              <Text size="sm" weight="medium">
                180px に絞ったとき
              </Text>
              <NavList
                label="ラベル長のストレス（狭幅）"
                items={LABEL_STRESS_ITEMS}
                activeId="mfa"
              />
            </Flex>
            <Flex direction="col" gap="sm" width={240}>
              <Text size="sm" weight="medium">
                icon あり · なしの混在
              </Text>
              <NavList label="アイコンの混在" items={MIXED_ICON_ITEMS} activeId="webhooks" />
            </Flex>
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>状態 · active · disabled · 破壊的操作</CardTitle>
          <CardDescription>
            これがないと、disabled な行が見た目だけ薄くなって遷移してしまいます。実際は
            aria-disabled が付き、href も落ちます。行そのものに tone
            はないので、「アカウントを削除」はただのルートです。取り返しのつかない操作はペイン側の
            Button variant=&quot;destructive&quot; が受け持ちます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction={{ base: "col", md: "row" }} gap="xl" align="start">
            <Flex direction="col" gap="sm" width={240}>
              <NavList label="状態" items={STATE_ITEMS} activeId="profile" />
            </Flex>
            <Flex direction="col" gap="sm" grow>
              <Text size="sm" weight="medium">
                「アカウントを削除」を選んだあとのペイン
              </Text>
              <Text size="sm" tone="muted">
                削除は 30 日後に確定します。それまでは同じ画面から取り消せます。
              </Text>
              <Flex>
                <Button variant="destructive" size="sm">
                  アカウントを削除
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>16 項目をレールに収める</CardTitle>
          <CardDescription>
            これがないと、NavList
            自体はスクロールしないという事実が隠れます。列は内容ぶんだけ伸び、積み重なったあとの詳細は画面外に落ちます。MasterDetail
            の中での答えは masterViewport=&quot;compact&quot;
            で、レールの中だけがスクロールします。消費側の max-height や overflow は使いません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MasterDetail
            rail="master"
            railWidth="compact"
            masterViewport="compact"
            masterLabel="設定（全 16 項目）"
            detailLabel="設定の内容"
            master={
              <NavList
                label="設定（全 16 項目）"
                items={LONG_ITEMS}
                activeId={longRoute}
                onSelect={setLongRoute}
              />
            }
          >
            <SettingsPane routeId={longRoute} />
          </MasterDetail>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>MasterDetail の外に置くとき</CardTitle>
          <CardDescription>
            これがないと、レールの外で同じ一覧を置いた瞬間に高さの制約が消えます。囲いが Card、
            スクロールするのは ScrollArea、高さはこの画面の寸法なので className に残ります。NavList
            側は何も変わりません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card>
            <CardContent flush solo>
              <ScrollArea className="h-64" scrollbar="always">
                <Flex direction="col" pad={3}>
                  <NavList label="設定（カード内スクロール）" items={LONG_ITEMS} activeId="audit" />
                </Flex>
              </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>項目が 0 件のとき</CardTitle>
          <CardDescription>
            これがないと、空配列が空の &lt;nav&gt;
            を残します。画面には何も出ないのに、スクリーンリーダーには名前だけのランドマークが残り、
            読み上げても中身がありません。0 件のときは NavList を描かず EmptyState に差し替えます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction={{ base: "col", md: "row" }} gap="xl" align="start">
            <Flex direction="col" gap="sm" width={280}>
              <Text size="sm" weight="medium">
                NavList items={"{[]}"} · 何も描かれない
              </Text>
              <NavList label="権限のある設定（0 件）" items={[]} />
            </Flex>
            <Flex direction="col" gap="sm" grow>
              <Text size="sm" weight="medium">
                差し替え
              </Text>
              <EmptyState
                variant="compact"
                icon={KeyRound}
                title="表示できる設定がありません"
                description="この組織での権限では設定項目を開けません。管理者に権限の付与を依頼してください。"
              />
            </Flex>
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>電話幅のとき</CardTitle>
          <CardDescription>
            これがないと、狭い幅でナビと内容が縦に積まれ、内容がナビの下 800px
            に沈みます。MasterDetail の mobilePane は一度に片方だけを見せ、戻り導線は detailBack
            が受け持ちます。選択そのものは URL と履歴の持ち主、つまり呼び出し側の責務です。ここでは
            collapseBelow=&quot;lg&quot;
            にして、このカードの幅でも折りたたみが見えるようにしています。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MasterDetail
            rail="master"
            railWidth="compact"
            collapseBelow="lg"
            mobilePane={narrowPane}
            masterLabel="設定"
            detailLabel="設定の内容"
            detailBack={
              <Button variant="ghost" size="sm" onClick={() => setNarrowPane("master")}>
                設定一覧へ戻る
              </Button>
            }
            master={
              <NavList
                label="設定"
                items={SETTINGS_NAV}
                activeId={narrowRoute}
                onSelect={(id) => {
                  setNarrowRoute(id);
                  setNarrowPane("detail");
                }}
              />
            }
          >
            <SettingsPane routeId={narrowRoute} />
          </MasterDetail>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
