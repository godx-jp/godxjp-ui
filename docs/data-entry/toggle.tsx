import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Toggle } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Toggle · a single pressed/unpressed button (Radix Toggle). Use for toolbar
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
              default（押下時だけ面が出る・休止時は透明な 1px 枠）· outline（--background
              の上の細い枠）· soft（休止時から --secondary で塗られる）。
              最初の二つはツールバー向けで、休止しているチップは「何もない」ように見える。
              チップとして並べるときは soft。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" wrap>
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
              <Toggle variant="soft" aria-label="草案のみ">
                草案のみ
              </Toggle>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              soft + shape=&quot;pill&quot; · チェック可能なタグチップ
            </CardTitle>
            <CardDescription>
              antd の Tag.CheckableTag にあたる形。soft が休止時の面を、shape が角を担う。shape は
              Button / Badge と同じ default / pill / sharp の三値で、同じ radius
              トークンを読む。押下すると面が --primary に反転するので、状態は色だけに依存しない。
              取り消せる（×つきの）タグは選択ではなく削除なので Badge の onRemove
              側、つまり別のコンポーネントになる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="sm" wrap align="center">
                <Toggle variant="soft" shape="pill" size="xs" defaultPressed>
                  設計
                </Toggle>
                <Toggle variant="soft" shape="pill" size="xs">
                  実装
                </Toggle>
                <Toggle variant="soft" shape="pill" size="xs">
                  検証
                </Toggle>
              </Flex>
              <Flex direction="row" gap="sm" wrap align="center">
                <Toggle variant="soft" shape="default">
                  default（--radius-md）
                </Toggle>
                <Toggle variant="soft" shape="pill">
                  pill
                </Toggle>
                <Toggle variant="soft" shape="sharp">
                  sharp
                </Toggle>
              </Flex>
              <Text as="p" size="xs" tone="muted">
                soft の面は Badge variant=&quot;secondary&quot; / Button
                variant=&quot;secondary&quot; と同じ --secondary。ホバーは不透明な --secondary-hover
                なので、ページの上でもカードの上でも同じ色になる。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Sizes</CardTitle>
            <CardDescription>
              xs 24px / sm 28px / md 32px / lg 36px · すべて --control-height
              の同じ段。行の高さが先に決まっている場所では、その段を選ぶ。xs は 24px
              の密な行にセグメント状のチップを載せるための段で、Button
              を並べて自作する代わりになる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" align="center">
              <Toggle size="xs" aria-label="極小サイズ">
                極小
              </Toggle>
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
            <CardTitle level={2}>24px の密な行 · size=&quot;xs&quot;</CardTitle>
            <CardDescription>
              行の高さが 24px に決まっている監査ログや明細ツールバーでは、xs
              のチップがそのまま収まる。同じ段の Button size=&quot;xs&quot;
              と高さが一致するので、行が段差にならない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Flex direction="row" gap="sm" align="center">
                <Toggle size="xs" defaultPressed aria-label="未読のみ">
                  未読のみ
                </Toggle>
                <Toggle size="xs" aria-label="添付あり">
                  添付あり
                </Toggle>
                <Button size="xs" variant="outline">
                  絞り込み
                </Button>
              </Flex>
              <Text as="p" size="xs" tone="muted">
                いずれも --control-height-xs（24px）。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Count</CardTitle>
            <CardDescription>
              count / overflowCount / showZero / countLabel · Button と同じ語彙。押下状態と数字が 1
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
