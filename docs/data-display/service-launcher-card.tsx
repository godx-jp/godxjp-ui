import {
  BookPlus,
  Clock3,
  Database,
  LayoutGrid,
  PlugZap,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import {
  ServiceCatalogCta,
  ServiceLauncherCard,
  ServiceLauncherCardSkeleton,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * ServiceLauncherCard — organization-scoped launcher states. The consumer supplies every status,
 * entitlement reason and action; the component owns only the shared visual contract.
 */
export default function Demo() {
  return (
    <PageContainer
      title="ServiceLauncherCard"
      subtitle="利用可能・制限中・読み込み中・カタログ導線"
    >
      <Flex direction="col" gap="lg">
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
          <ServiceLauncherCard
            icon={Clock3}
            title="勤怠管理"
            statusLabel="LIVE"
            statusTone="success"
            description="打刻、シフト、休暇申請を一つのワークスペースで管理します。"
            metadata="attendance.godx.jp · Standard"
            action={<Button>サービスを開く</Button>}
          />
          <ServiceLauncherCard
            icon={ReceiptText}
            title="請求管理"
            statusLabel="要契約"
            statusTone="warning"
            description="請求書、支払い方法、利用明細を管理します。"
            metadata="billing.godx.jp"
            disabledReason="この組織には有効な請求管理プランがありません。"
            action={<Button disabled>サービスを開く</Button>}
          />
          <ServiceLauncherCard
            icon={ShieldCheck}
            title="高度なセキュリティ管理と監査ログ"
            statusLabel="管理者限定"
            statusTone="info"
            description="権限、二要素認証ポリシー、監査イベントを確認します。"
            metadata="security.godx.jp · Enterprise"
            action={<Button variant="outline">権限を確認</Button>}
          />
          <ServiceLauncherCardSkeleton label="サービスを読み込み中" />
          <ServiceCatalogCta
            title="サービスカタログから追加"
            action={<Button variant="outline">カタログを見る</Button>}
          />
        </ResponsiveGrid>

        {/* Remaining status tones — the label text is always the consumer's own copy; the
         * component maps only the tone to a semantic Badge. */}
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
          <ServiceLauncherCard
            icon={Database}
            titleLevel={3}
            title="データ連携基盤"
            statusLabel="停止中"
            statusTone="destructive"
            description="外部システムとのデータ同期ジョブを管理します。"
            metadata="sync.godx.jp · Enterprise"
            disabledReason="このサービスは組織の管理者によって停止されています。"
            action={<Button disabled>サービスを開く</Button>}
          />
          <ServiceLauncherCard
            icon={PlugZap}
            titleLevel={3}
            title="連携アプリ"
            statusLabel="準備中"
            statusTone="neutral"
            description="サードパーティ連携の接続とスコープを設定します。"
            action={<Button variant="outline">設定を開く</Button>}
          />
          <ServiceLauncherCard
            icon={BookPlus}
            titleLevel={3}
            title="ナレッジベース"
            statusLabel="アーカイブ"
            statusTone="muted"
            description="社内ドキュメントと運用手順を保管します。"
            metadata="kb.godx.jp · Free"
            action={<Button variant="outline">アーカイブを見る</Button>}
          />
          {/* The companion CTA takes an explicit glyph when the default `Plus` is too generic. */}
          <ServiceCatalogCta
            icon={LayoutGrid}
            title="すべてのサービスを見る"
            action={<Button variant="ghost">カタログ一覧</Button>}
          />
        </ResponsiveGrid>

        {/* Long JA / EN / VI names + an unbreakable hostname: the tile must wrap, never widen its
         * grid column. Same 3 → 2 → 1 grid, no page-local CSS anywhere. */}
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
          <ServiceLauncherCard
            icon={ShieldCheck}
            titleLevel={3}
            title="グローバル人事情報基盤・従業員セルフサービスポータル（アジア太平洋地域）"
            statusLabel="LIVE"
            statusTone="success"
            description="人事マスタ、勤怠、給与、評価を一元管理する統合ワークスペースです。"
            metadata="workforce-identity-administration.ap-northeast-1.godx.jp · Enterprise"
            action={<Button>サービスを開く</Button>}
          />
          <ServiceLauncherCard
            icon={ShieldCheck}
            titleLevel={3}
            title="Acme Global Workforce Identity & Entitlement Administration Console"
            statusLabel="Attention required"
            statusTone="warning"
            description="Review pending entitlement requests before the next access certification."
            metadata="workforce-identity-administration.ap-northeast-1.godx.jp · Enterprise"
            disabledReason="Your organization has no active subscription for this service yet."
            action={<Button disabled>Open service</Button>}
          />
          <ServiceLauncherCard
            icon={ShieldCheck}
            titleLevel={3}
            title="Cổng quản trị định danh và phân quyền nhân sự toàn cầu của doanh nghiệp"
            statusLabel="Chỉ quản trị viên"
            statusTone="info"
            description="Xem lại quyền truy cập, chính sách xác thực hai yếu tố và nhật ký kiểm toán."
            metadata="workforce-identity-administration.ap-southeast-1.godx.jp · Enterprise"
            action={<Button variant="outline">Xem quyền truy cập</Button>}
          />
        </ResponsiveGrid>
      </Flex>
    </PageContainer>
  );
}
