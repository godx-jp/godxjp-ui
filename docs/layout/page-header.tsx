import { useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Label, Switch } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, MasterDetail, PageContainer, PageHeader } from "@godxjp/ui/layout";

/**
 * PageHeader · ページタイトル帯の正準コントラクト (gh#255)。
 *
 * PageContainer が内部でレンダリングしているのと「同一の」コンポーネント。実装はひとつだけなので、
 * ページ内では PageContainer に props を渡し、ページシェルの外 (Sheet の詳細面、MasterDetail の
 * detail ペイン、タブ本体) でだけこの単体 export を使う。
 *
 * Shows: title / subtitle / breadcrumb / meta / extra の全スロット、layout の両値
 * (stack · responsive-inline)、loading の保留状態、そして JA・EN・VI の長文ラベル。
 * 幾何はすべてトークン所有 (--page-header-meta-gap, --page-header-extra-measure,
 * --page-title-placeholder-*)。このページには幅指定もメディアクエリも一切ない。
 *
 * ランドマーク注意 (このページが `<section>` で包んでいる理由):
 *   `<header>` が banner ランドマークになるのは「sectioning content の外」にあるときだけ。
 *   PageContainer の中に単体 PageHeader を素の div で置くと banner が 2 つになり
 *   axe の landmark-unique に落ちる。実際の設置先 (Sheet · MasterDetail の section ·
 *   タブパネル) はいずれも sectioning 要素なので、この包みは現実の使い方そのもの。
 */

const LONG_COPY = {
  ja: {
    title: "請求データ連携ワークスペースの詳細設定と監査ログ",
    subtitle: "支店ごとの連携状態、直近の同期結果、失敗したレコードの再送履歴を確認できます。",
  },
  en: {
    title: "Billing integration workspace configuration and audit trail",
    subtitle:
      "Review per-branch connection state, the most recent synchronisation result, and the resend history for failed records.",
  },
  vi: {
    title: "Cấu hình không gian tích hợp dữ liệu hoá đơn và nhật ký kiểm toán",
    subtitle:
      "Xem trạng thái kết nối theo từng chi nhánh, kết quả đồng bộ gần nhất và lịch sử gửi lại các bản ghi lỗi.",
  },
} as const;

type Locale = keyof typeof LONG_COPY;

const MEMBERS = [
  { id: "sato", name: "佐藤 智", role: "管理者", status: "有効" },
  { id: "tanaka", name: "田中 花子", role: "編集者", status: "有効" },
  { id: "suzuki", name: "鈴木 一郎", role: "閲覧者", status: "招待中" },
];

const MEMBER_DETAIL_ID = "page-header-member-detail";

export default function PageHeaderPage() {
  const [locale, setLocale] = useState<Locale>("ja");
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState(MEMBERS[0].id);

  const copy = LONG_COPY[locale];
  const member = MEMBERS.find((m) => m.id === memberId) ?? MEMBERS[0];

  return (
    <PageContainer
      title="PageHeader"
      subtitle="ページタイトル帯 · PageContainer と同一実装の単体 export"
      breadcrumb={[
        { label: "ホーム", to: "/" },
        { label: "Layout", to: "/layout" },
        { label: "PageHeader" },
      ]}
      // Three breadcrumb trails render on this one page, so each nav landmark needs a DISTINCT
      // accessible name — two <nav>s sharing one name/role fail axe's landmark-unique (WCAG
      // 2.4.1 / 1.3.1). This page is the live proof of why `breadcrumbLabel` exists.
      breadcrumbLabel="このページのパンくず"
      meta={<Badge tone="info">gh#255</Badge>}
      extra={
        <Flex direction="row" gap="sm" align="center" wrap>
          <Label htmlFor="page-header-loading">保留状態</Label>
          <Switch id="page-header-loading" checked={loading} onCheckedChange={setLoading} />
        </Flex>
      }
    >
      <Flex direction="col" gap="lg">
        {/* ── 0. PageContainer 自身のヘッダー ──
            上のタイトル帯 (breadcrumb · h1 · meta · extra) は、このページで下に並ぶものと
            同じ PageHeader。ページの中では常にこちら側 — 単体 export を入れ子にすると
            <h1> が 2 つになる。 */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>ページ内での使い方</CardTitle>
            <CardDescription>
              このページ上部の帯こそが PageHeader です。PageContainer が title / subtitle /
              breadcrumb / meta / extra をそのまま転送しています。ページ内で単体 export を
              置いてはいけません。
            </CardDescription>
          </CardHeader>
        </Card>

        {/* ── 1. スロットの段階的追加 — title のみ → subtitle → breadcrumb → meta → extra。
               meta を渡さない限りタイトル帯のラッパーは出力されず、従来の <h1> 単独 DOM のまま。 ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>スロット</CardTitle>
            <CardDescription>title のみ / +subtitle / +breadcrumb / +meta / +extra</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <section aria-label="title のみ">
                <PageHeader title="請求一覧" />
              </section>

              <section aria-label="title と subtitle">
                <PageHeader title="請求一覧" subtitle="直近30日間の受注データ" />
              </section>

              <section aria-label="breadcrumb つき">
                <PageHeader
                  title="請求一覧"
                  subtitle="直近30日間の受注データ"
                  breadcrumb={[
                    { label: "ホーム", to: "/" },
                    { label: "会計", to: "/accounting" },
                    { label: "請求一覧" },
                  ]}
                  breadcrumbLabel="請求一覧のパンくず"
                />
              </section>

              {/* meta はステータス Badge の置き場所。title に混ぜないこと —
                  <h1> のアクセシブル名がタイトルだけで済み、長い JA/VI タイトルが
                  Badge を引きずらずに折り返せる。 */}
              <section aria-label="meta つき">
                <PageHeader
                  title="請求書 #4021"
                  subtitle="株式会社ゴドー · 2026年7月分"
                  meta={
                    <Flex direction="row" gap="xs" align="center" wrap>
                      <Badge tone="warning">期限超過</Badge>
                      <Badge tone="neutral">再送 2 回</Badge>
                    </Flex>
                  }
                />
              </section>

              <section aria-label="extra つき">
                <PageHeader
                  title="請求書 #4021"
                  subtitle="株式会社ゴドー · 2026年7月分"
                  meta={<Badge tone="warning">期限超過</Badge>}
                  extra={
                    <Flex direction="row" gap="sm" wrap>
                      <Button variant="outline">複製</Button>
                      <Button>再送信</Button>
                    </Flex>
                  }
                />
              </section>
            </Flex>
          </CardContent>
        </Card>

        {/* ── 2. layout — 640px 未満での title 帯と extra の並び。
               stack (既定): extra は subtitle の下に全幅で落ちる。
               responsive-inline: --page-header-extra-measure (11rem) の幅で title の横に留まる。
               640px 以上では両者は完全に同一。 ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>layout · stack · responsive-inline</CardTitle>
            <CardDescription>
              390px で違いが出ます。1440 / 1024 では両者は同一の行に解決します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <section aria-label='layout="stack"'>
                <Text tone="muted">layout=&quot;stack&quot; — 既定</Text>
                <PageHeader
                  layout="stack"
                  title="メンバー"
                  subtitle="組織に所属するユーザー"
                  extra={<Button>招待</Button>}
                />
              </section>

              <section aria-label='layout="responsive-inline"'>
                <Text tone="muted">layout=&quot;responsive-inline&quot;</Text>
                <PageHeader
                  layout="responsive-inline"
                  title="メンバー"
                  subtitle="組織に所属するユーザー"
                  extra={<Button>招待</Button>}
                />
              </section>
            </Flex>
          </CardContent>
        </Card>

        {/* ── 3. loading — タイトル帯だけの保留状態。
               <h1> は見出しアウトラインに残り、sr-only のアクセシブル名を持つ
               (中身が装飾ボックスだけの見出しは axe の empty-heading 違反)。
               breadcrumb と extra はスケルトン化しない — それらはレコードではなく
               ルートから来るため。 ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>loading</CardTitle>
            <CardDescription>
              レコード到着前でも見出しアウトラインとパンくずが安定する。上部のスイッチで切り替え。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <section aria-label="loading 状態">
              <PageHeader
                loading={loading}
                title="請求書 #4021"
                subtitle="株式会社ゴドー · 2026年7月分"
                meta={<Badge tone="warning">期限超過</Badge>}
                breadcrumb={[{ label: "ホーム", to: "/" }, { label: "請求書 #4021" }]}
                breadcrumbLabel="請求書 #4021 のパンくず"
                extra={<Button>再送信</Button>}
              />
            </section>
          </CardContent>
        </Card>

        {/* ── 4. 長文ラベル — JA / EN / VI。
               タイトルは overflow-wrap: anywhere で折り返し、meta は title 帯の中で
               --page-header-meta-gap を保ったまま次行に回る。390px でも切り詰めない。 ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>長文ラベル · JA · EN · VI</CardTitle>
            <CardDescription>
              どの言語でも切り詰めず折り返す。extra は最小幅を割らずに次行へ。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Flex direction="row" gap="sm" wrap>
                {(Object.keys(LONG_COPY) as Locale[]).map((code) => (
                  <Button
                    key={code}
                    variant={code === locale ? "secondary" : "outline"}
                    aria-pressed={code === locale}
                    onClick={() => setLocale(code)}
                  >
                    {code.toUpperCase()}
                  </Button>
                ))}
              </Flex>

              <section aria-label="長文ラベル">
                <PageHeader
                  title={copy.title}
                  subtitle={copy.subtitle}
                  meta={<Badge tone="info">{locale.toUpperCase()}</Badge>}
                  extra={
                    <Flex direction="row" gap="sm" wrap>
                      <Button variant="outline">エクスポート</Button>
                      <Button>同期</Button>
                    </Flex>
                  }
                />
              </section>
            </Flex>
          </CardContent>
        </Card>

        {/* ── 5. 単体 export の本来の用途 — ページシェルの外。
               MasterDetail の detail は <section> なので、その中の <header> は banner に
               ならない。選択されたレコードが自分のタイトル帯・ステータス・操作を持ち、
               ページ側の PageContainer タイトルはコレクションを指したままになる。 ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>ページシェルの外で使う</CardTitle>
            <CardDescription>
              MasterDetail の detail ペイン。ここが単体 export を使う理由です。consumer 側で
              .page-header 相当の CSS を書き直さずに同じ帯が手に入る。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MasterDetail
              masterLabel="メンバー一覧"
              detailLabel={`${member.name} の詳細`}
              detailId={MEMBER_DETAIL_ID}
              master={
                <Flex direction="col" gap="xs">
                  {MEMBERS.map((item) => (
                    <Button
                      key={item.id}
                      variant={item.id === memberId ? "secondary" : "ghost"}
                      aria-pressed={item.id === memberId}
                      aria-controls={MEMBER_DETAIL_ID}
                      onClick={() => setMemberId(item.id)}
                    >
                      {item.name}
                      <Badge tone="neutral">{item.role}</Badge>
                    </Button>
                  ))}
                </Flex>
              }
            >
              <Flex direction="col" gap="md">
                <PageHeader
                  title={member.name}
                  subtitle={`権限: ${member.role}`}
                  meta={
                    <Badge tone={member.status === "有効" ? "success" : "warning"}>
                      {member.status}
                    </Badge>
                  }
                  extra={<Button variant="outline">権限を変更</Button>}
                />
                <Text tone="muted">
                  detail は tabIndex=-1 の
                  region。選択後にここへフォーカスを移すのは呼び出し側の責務。
                </Text>
              </Flex>
            </MasterDetail>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
