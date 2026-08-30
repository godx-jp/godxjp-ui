import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Toggle } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Toggle — a single pressed/unpressed button (Radix Toggle). Use for toolbar
 * actions and pinned filters. For multi-option selection use ToggleGroup.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [bold, setBold] = useState(false);
  const [pinned, setPinned] = useState(true);
  const [outline, setOutline] = useState(false);
  const [unread, setUnread] = useState(true);

  return (
    <PageContainer
      title="Toggle"
      subtitle="Single pressed/unpressed button · toolbar actions, pinned filters"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Controlled state</CardTitle>
            <CardDescription>
              Controlled via pressed/onPressedChange. Suitable for toolbar formatting or filter
              pins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md">
              <Toggle pressed={bold} onPressedChange={setBold} aria-label="太字">
                太字
              </Toggle>
              <Toggle pressed={pinned} onPressedChange={setPinned} aria-label="未払いをピン留め">
                未払いをピン留め
              </Toggle>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Variants</CardTitle>
            <CardDescription>
              default (filled background when pressed) vs outline (border style).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md">
              <Toggle
                variant="default"
                pressed={pinned}
                onPressedChange={setPinned}
                aria-label="仕訳フィルタ"
              >
                仕訳フィルタ
              </Toggle>
              <Toggle
                variant="outline"
                pressed={outline}
                onPressedChange={setOutline}
                aria-label="消費税対象のみ"
              >
                消費税対象のみ
              </Toggle>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Sizes</CardTitle>
            <CardDescription>sm / md / lg · match surrounding density.</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" align="center">
              <Toggle size="sm" aria-label="小サイズ">
                小
              </Toggle>
              <Toggle size="md" aria-label="標準サイズ">
                標準
              </Toggle>
              <Toggle size="lg" aria-label="大サイズ">
                大
              </Toggle>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Count</CardTitle>
            <CardDescription>
              count / overflowCount / showZero / countLabel — Button と同じ語彙。押下状態と数字が 1
              つのコントロールに乗るので、ファセットフィルタチップやリアクションチップが real
              primitive だけで書ける。数字は Intl.NumberFormat
              でロケール整形され、アクセシブル名は「未読, 12 件」のように読み上げられる。
              さらに詳しい実画面は Toggle Count のページを参照。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" align="center" wrap>
              <Toggle
                pressed={unread}
                onPressedChange={setUnread}
                count={12}
                countLabel="件"
                variant="outline"
              >
                未読
              </Toggle>
              <Toggle count={1240} overflowCount={999} countLabel="件" variant="outline">
                すべて
              </Toggle>
              <Toggle count={0} showZero={false} countLabel="件" variant="outline">
                下書き
              </Toggle>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
