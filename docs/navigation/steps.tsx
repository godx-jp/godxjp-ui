import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Steps } from "@godxjp/ui/navigation";

/**
 * Steps — multi-step progress indicator. Horizontal or vertical, default or dot style.
 * Drive current from state; use status='error' to mark the active step failed.
 * Composed only from real @godxjp/ui components.
 */
const approvalSteps = [
  { title: "申請", description: "申請者が提出" },
  { title: "一次審査", description: "部門長レビュー" },
  { title: "経理承認", description: "経理部チェック" },
  { title: "完了", description: "支払処理済" },
];

const onboardingSteps = [
  { title: "基本情報", subtitle: "必須" },
  { title: "法人設定", subtitle: "税務情報" },
  { title: "銀行口座", subtitle: "入出金" },
  { title: "確認・完了" },
];

export default function Demo() {
  const [approvalCurrent, setApprovalCurrent] = useState(1);
  const [wizardCurrent, setWizardCurrent] = useState(0);
  const [hasError, setHasError] = useState(false);

  return (
    <PageContainer
      title="Steps"
      subtitle="Horizontal + vertical, default + dot · drive current from state"
    >
      <Flex direction="col" gap="lg">
        {/* Horizontal — default style with descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>水平 · default スタイル (経費承認フロー)</CardTitle>
            <CardDescription>
              items に title + description を渡す。current は 0-based index。 前のステップは
              finish、現在は process、後のステップは wait。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Steps value={approvalCurrent} items={approvalSteps} />
          </CardContent>
        </Card>

        {/* Interactive — advance/retreat */}
        <Card>
          <CardHeader>
            <CardTitle>インタラクティブ · ステップを進む / 戻る</CardTitle>
            <CardDescription>
              onValueChange を渡すと各ステップがクリッカブルになる。ボタンで value
              を制御することもできる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Steps
                value={approvalCurrent}
                items={approvalSteps}
                onValueChange={setApprovalCurrent}
              />
              <Flex direction="row" gap="sm">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={approvalCurrent === 0}
                  onClick={() => setApprovalCurrent((c) => c - 1)}
                >
                  戻る
                </Button>
                <Button
                  size="sm"
                  disabled={approvalCurrent >= approvalSteps.length - 1}
                  onClick={() => setApprovalCurrent((c) => c + 1)}
                >
                  次へ
                </Button>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* Error status on current step */}
        <Card>
          <CardHeader>
            <CardTitle>status=&quot;error&quot; — 現在ステップをエラー表示</CardTitle>
            <CardDescription>
              status prop を error にするとアクティブステップが赤くなる。
              バリデーション失敗時にフォームと組み合わせて使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Steps value={2} status={hasError ? "error" : "process"} items={approvalSteps} />
              <Button size="sm" variant="outline" onClick={() => setHasError((e) => !e)}>
                {hasError ? "エラーをクリア" : "エラーを発生させる"}
              </Button>
            </Flex>
          </CardContent>
        </Card>

        {/* Vertical — default style */}
        <Card>
          <CardHeader>
            <CardTitle>垂直 · default スタイル (法人オンボーディング)</CardTitle>
            <CardDescription>
              orientation=&quot;vertical&quot; でサイドバーやサイドパネルに収まる縦型レイアウト。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="xl">
              <Steps
                orientation="vertical"
                value={wizardCurrent}
                items={onboardingSteps}
                onValueChange={setWizardCurrent}
              />
              <Flex direction="col" gap="md" className="flex-1">
                <Text as="p" weight="medium">
                  ステップ {wizardCurrent + 1}: {onboardingSteps[wizardCurrent].title}
                </Text>
                <Text as="p" tone="muted">
                  このステップのフォームコンテンツがここに表示されます。
                </Text>
                <Flex direction="row" gap="sm">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={wizardCurrent === 0}
                    onClick={() => setWizardCurrent((c) => c - 1)}
                  >
                    戻る
                  </Button>
                  <Button
                    size="sm"
                    disabled={wizardCurrent >= onboardingSteps.length - 1}
                    onClick={() => setWizardCurrent((c) => c + 1)}
                  >
                    次へ
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* Dot style — compact */}
        <Card>
          <CardHeader>
            <CardTitle>Dot スタイル · コンパクト (type=&quot;dot&quot;)</CardTitle>
            <CardDescription>
              type=&quot;dot&quot; + size=&quot;sm&quot; で最小フットプリントのプログレスガイド。
              サイドバーのオンボーディングチェックリストに最適。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Steps
              type="dot"
              size="sm"
              orientation="vertical"
              value={2}
              items={[
                { title: "会社情報", status: "finish" },
                { title: "代表者情報", status: "finish" },
                { title: "税務署設定" },
                { title: "銀行口座" },
                { title: "完了確認" },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
