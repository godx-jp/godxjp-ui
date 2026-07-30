import { Clock3, ReceiptText, ShieldCheck } from "lucide-react";

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
      </Flex>
    </PageContainer>
  );
}
