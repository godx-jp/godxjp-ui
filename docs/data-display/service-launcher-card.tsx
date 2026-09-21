import {
  BookOpen,
  Boxes,
  Calendar,
  Clock3,
  Database,
  FileText,
  LayoutGrid,
  Mail,
  PlugZap,
  ReceiptText,
  Server,
  ShieldCheck,
} from "lucide-react";

import {
  ServiceCatalogCta,
  ServiceLauncherCard,
  ServiceLauncherCardSkeleton,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * ServiceLauncherCard — one tile for one application in an organization's launcher.
 *
 * WHY THIS PAGE IS GENERIC. It used to render this product's own service catalogue —
 * `attendance.godx.jp`, plans `Standard/Enterprise/Free`, a 「カタログを見る」 link — which made a
 * reader ask whether the component belonged in a UI framework at all. A fair question: a page that
 * demonstrates a product cannot demonstrate a component. The data here is therefore ANY
 * organization's internal tools, on RFC 2606 reserved domains, with no plan names of ours.
 *
 * WHAT IS NOT NEGOTIABLE is the state set — available / restricted / suspended / archived /
 * loading / catalog entry. Those ARE the component's API surface, because the component infers
 * nothing: `statusLabel`, `statusTone`, `disabledReason` and `action` all come from the consumer's
 * own entitlement contract. There is no `href`, no `available`, no `entitlement` prop to find.
 *
 * ResponsiveGrid owns the 3 → 2 → 1 ladder. The page writes no grid tracks and no page-local CSS.
 */

/** A section heading. Headings are headings, not Cards — a Card here would nest borders. */
function Section({
  title,
  why,
  children,
}: {
  title: string;
  why: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="col" gap="sm">
      <Text as="div" weight="medium">
        {title}
      </Text>
      <Text as="div" size="sm" tone="muted">
        {why}
      </Text>
      {children}
    </Flex>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="ServiceLauncherCard"
      subtitle="社内アプリケーション一覧のタイル — 利用可能・制限・停止・アーカイブ・読み込み中・カタログ導線"
    >
      <Flex direction="col" gap="lg">
        <Section
          title="1 · 基本 · 利用できるサービス"
          why="アイコン・名称・ステータス・説明・識別子・操作。ステータスの文言は常に利用側のコピーで、コンポーネントが決めるのは tone に対応する Badge の意味づけだけです。"
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={Clock3}
              title="勤怠管理"
              statusLabel="利用可能"
              statusTone="success"
              description="打刻、シフト、休暇申請を一つのワークスペースで管理します。"
              metadata="attend.corp.example.jp · v4.2"
              action={<Button>サービスを開く</Button>}
            />
            <ServiceLauncherCard
              icon={ReceiptText}
              title="経費精算"
              statusLabel="利用可能"
              statusTone="success"
              description="領収書の提出から承認、仕訳連携までを扱います。"
              metadata="keihi.corp.example.jp · v2.8"
              action={<Button>サービスを開く</Button>}
            />
            <ServiceLauncherCard
              icon={Calendar}
              title="会議室予約"
              statusLabel="利用可能"
              statusTone="success"
              description="拠点ごとの会議室と備品を予約します。"
              metadata="rooms.corp.example.jp · v1.9"
              action={<Button>サービスを開く</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title="2 · statusTone の 6 値すべて"
          why="success / warning / destructive / info / neutral / muted。tone は Badge の意味づけだけを決め、文言・判定・操作の可否はすべて利用側が渡します。"
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={Mail}
              titleLevel={3}
              title="社内メール"
              statusLabel="稼働中"
              statusTone="success"
              description="メールボックス、配布リスト、共有署名を管理します。"
              metadata="mail.corp.example.jp"
              action={<Button>サービスを開く</Button>}
            />
            <ServiceLauncherCard
              icon={Server}
              titleLevel={3}
              title="ファイル共有"
              statusLabel="メンテナンス中"
              statusTone="warning"
              description="部門フォルダと外部共有リンクを扱います。"
              metadata="files.corp.example.jp"
              action={<Button variant="outline">状況を見る</Button>}
            />
            <ServiceLauncherCard
              icon={Database}
              titleLevel={3}
              title="データ連携基盤"
              statusLabel="停止中"
              statusTone="destructive"
              description="外部システムとのデータ同期ジョブを管理します。"
              metadata="sync.corp.example.jp"
              action={<Button variant="outline">履歴を見る</Button>}
            />
            <ServiceLauncherCard
              icon={ShieldCheck}
              titleLevel={3}
              title="権限管理"
              statusLabel="管理者限定"
              statusTone="info"
              description="ロール、二要素認証ポリシー、監査イベントを確認します。"
              metadata="iam.corp.example.jp"
              action={<Button variant="outline">権限を確認</Button>}
            />
            <ServiceLauncherCard
              icon={PlugZap}
              titleLevel={3}
              title="連携アプリ"
              statusLabel="準備中"
              statusTone="neutral"
              description="サードパーティ連携の接続とスコープを設定します。"
              metadata="connect.corp.example.jp"
              action={<Button variant="outline">設定を開く</Button>}
            />
            <ServiceLauncherCard
              icon={BookOpen}
              titleLevel={3}
              title="旧ナレッジベース"
              statusLabel="アーカイブ"
              statusTone="muted"
              description="2024 年度までの運用手順を読み取り専用で保管しています。"
              metadata="kb-archive.corp.example.jp"
              action={<Button variant="outline">アーカイブを見る</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title="3 · disabledReason · 操作が効かない理由は操作より先に置かれる"
          why="無効化されたボタンは「なぜ」を一切伝えません。だから理由は DOM 順で操作より先に置かれ（WCAG 2.2 · 1.3.2）、タイルは data-unavailable を帯びてメダリオンが沈みます。disabledReason はボタンを無効化しません — それは利用側の Button prop のままです。"
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={Boxes}
              titleLevel={3}
              title="在庫管理"
              statusLabel="未申請"
              statusTone="warning"
              description="拠点別の在庫、入出庫、棚卸を管理します。"
              metadata="zaiko.corp.example.jp"
              disabledReason="この部門ではまだ利用申請が承認されていません。"
              action={<Button disabled>サービスを開く</Button>}
            />
            <ServiceLauncherCard
              icon={FileText}
              titleLevel={3}
              title="契約書管理"
              statusLabel="権限なし"
              statusTone="info"
              description="契約書の保管、期限通知、電子署名の依頼を扱います。"
              metadata="keiyaku.corp.example.jp"
              disabledReason="閲覧には法務部門のロールが必要です。IT ヘルプデスクへ申請してください。"
              action={<Button disabled>サービスを開く</Button>}
            />
            <ServiceLauncherCard
              icon={Database}
              titleLevel={3}
              title="分析基盤"
              statusLabel="停止中"
              statusTone="destructive"
              description="全社ダッシュボードとデータマートを提供します。"
              metadata="bi.corp.example.jp"
              disabledReason="このサービスは組織の管理者によって停止されています。"
              action={<Button disabled>サービスを開く</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title="4 · 読み込み中とカタログ導線"
          why="ServiceLauncherCardSkeleton は同じ骨格の初期プレースホルダーで、label が必須・aria-busy を持ち、ライブリージョンは意図的に開きません。ServiceCatalogCta は実在する追加導線がある場合にだけ並べる相棒タイルで、既定の Plus 以外のグリフも受け取ります。"
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCardSkeleton label="サービスを読み込み中" />
            <ServiceCatalogCta
              title="アプリを追加"
              action={<Button variant="outline">申請フォームを開く</Button>}
            />
            <ServiceCatalogCta
              icon={LayoutGrid}
              title="すべての社内アプリを見る"
              action={<Button variant="ghost">一覧を開く</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title="5 · 端に触れる · 3 行の名称、説明なし、切れない長いホスト名"
          why="整った例はタイルが崩れる場所を何も見せません。ここは崩れる側です：3 行になる名称と 2 語の名称が同じ行に並び、説明のないタイルが説明のあるタイルの隣に置かれ、空白のないホスト名が列幅を広げようとします。見苦しく見えるなら、このセクションは仕事をしています — 耐えるのはサンプルデータではなくコンポーネントの側です。"
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={ShieldCheck}
              titleLevel={3}
              title="グローバル人事情報基盤・従業員セルフサービスポータル（アジア太平洋地域）"
              statusLabel="利用可能"
              statusTone="success"
              description="人事マスタ、勤怠、給与、評価を一元管理する統合ワークスペースです。"
              metadata="workforce-identity-administration.ap-northeast-1.corp.example.jp · v11.0"
              action={<Button>サービスを開く</Button>}
            />
            <ServiceLauncherCard
              icon={Clock3}
              titleLevel={3}
              title="日報"
              statusLabel="利用可能"
              statusTone="success"
              metadata="nippo.corp.example.jp"
              action={<Button>サービスを開く</Button>}
            />
            <ServiceLauncherCard
              icon={Server}
              titleLevel={3}
              title="Global Workforce Identity & Entitlement Administration Console"
              statusLabel="Attention required"
              statusTone="warning"
              description="Review pending entitlement requests before the next access certification."
              metadata="workforce-identity-administration.ap-southeast-1.corp.example.com"
              disabledReason="Your organization has no approved request for this service yet."
              action={<Button disabled>Open service</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title="6 · 最小のタイル"
          why="必須は icon・title・action の 3 つだけです。statusLabel を省けば Badge の行ごと消え、description と metadata を省いても骨格は保たれます — 隣の満載のタイルと高さを比べてください。"
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={BookOpen}
              titleLevel={3}
              title="社内 Wiki"
              action={<Button variant="outline">開く</Button>}
            />
            <ServiceLauncherCard
              icon={Mail}
              titleLevel={3}
              title="問い合わせ窓口"
              description="社内のシステム相談はこちらで受け付けています。"
              action={<Button variant="outline">開く</Button>}
            />
            <ServiceLauncherCard
              icon={Calendar}
              titleLevel={3}
              title="全社カレンダー"
              statusLabel="利用可能"
              statusTone="success"
              description="全社行事、休業日、拠点別の予定を共有します。"
              metadata="calendar.corp.example.jp · v3.1"
              disabledReason="読み取り専用で公開されています。"
              action={<Button variant="outline">開く</Button>}
            />
          </ResponsiveGrid>
        </Section>
      </Flex>
    </PageContainer>
  );
}
