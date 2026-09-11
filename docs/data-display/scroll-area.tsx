import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ScrollArea,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * ScrollArea — a native scrolling box. ALWAYS give it an explicit height/max-height
 * (vertical) or width (horizontal), or nothing ever overflows and no scrollbar appears.
 * `orientation` decides which axes may scroll; the browser draws the bar, styled from
 * the --scroll-area-* tokens. Composed only from real @godxjp/ui components.
 */
const entries = Array.from(
  { length: 18 },
  (_, i) => `仕訳 #2024-${String(312 - i).padStart(4, "0")}`,
);

const shortEntries = entries.slice(0, 3);

/**
 * The live-stream screen. A deterministic clock: the demo never reads `Date.now()`, so the
 * frame is stable, and every timestamp still goes through `Intl.DateTimeFormat` (IANA tz, 24h).
 */
const STREAM_EPOCH = Date.UTC(2026, 2, 3, 0, 30, 0);
const STREAM_STEP_MS = 45_000;
const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tokyo",
});

type StreamPost = { id: number; author: string; body: string };

const AUTHORS = ["佐藤 千尋", "山本 直樹", "Nguyễn Minh", "経理ボット"];

const makePost = (id: number): StreamPost => ({
  id,
  author: AUTHORS[((id % AUTHORS.length) + AUTHORS.length) % AUTHORS.length],
  body:
    id % 4 === 0
      ? `月次締めのバッチが完了しました（#${String(1000 + id)}）。`
      : `伝票 #2026-${String(1000 + id)} を確認しました。`,
});

const INITIAL_POSTS = Array.from({ length: 24 }, (_, index) => makePost(index + 1));

const columns = [
  "勘定科目",
  "借方",
  "貸方",
  "摘要",
  "部門",
  "プロジェクト",
  "取引先",
  "登録者",
  "承認者",
];

export default function Demo() {
  const [posts, setPosts] = React.useState<StreamPost[]>(INITIAL_POSTS);
  const [oldestLoaded, setOldestLoaded] = React.useState(1);
  const [newestSeen, setNewestSeen] = React.useState(INITIAL_POSTS.length);
  const [anchored, setAnchored] = React.useState(true);
  const streamViewport = React.useRef<HTMLDivElement>(null);

  const receiveNewPost = () => {
    const id = newestSeen + 1;
    setNewestSeen(id);
    setPosts((current) => [...current, makePost(id)]);
  };

  const loadOlderPage = () => {
    const from = oldestLoaded - 10;
    setOldestLoaded(from);
    setPosts((current) => [
      ...Array.from({ length: 10 }, (_, index) => makePost(from + index)),
      ...current,
    ]);
  };

  // The keyboard route back to the newest item. Anchoring must never be the ONLY way there, so the
  // affordance is a real Button, not a scroll gesture.
  const jumpToNewest = () => {
    const viewport = streamViewport.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  };

  return (
    <PageContainer
      title="ScrollArea"
      subtitle="Native scrolling, token-styled scrollbar · needs an explicit height"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>ライブ配信ログ（anchor=&quot;bottom&quot;）</CardTitle>
            <CardDescription>
              チャットや監査ログのように増え続けるストリーム。最下部にいる間だけ新着に追従し、履歴を読むために少しでも上へスクロールしたら二度と勝手に動きません（WCAG
              3.2.5）。「過去を読み込む」で上に挿入しても、いま読んでいる行は動きません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card variant="outline" className="h-64 w-full">
              <CardContent flush>
                <ScrollArea
                  anchor="bottom"
                  viewportRef={streamViewport}
                  onAnchoredChange={setAnchored}
                >
                  <CardContent>
                    <Flex direction="col">
                      {posts.map((post) => (
                        <Flex key={post.id} direction="col" gap="xs">
                          <Flex gap="sm" align="baseline">
                            <Text size="sm" weight="medium">
                              {post.author}
                            </Text>
                            <Text size="xs" tone="muted">
                              {timeFormatter.format(
                                new Date(STREAM_EPOCH + post.id * STREAM_STEP_MS),
                              )}
                            </Text>
                          </Flex>
                          <Text size="sm" tone="muted">
                            {post.body}
                          </Text>
                        </Flex>
                      ))}
                    </Flex>
                  </CardContent>
                </ScrollArea>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter>
            <Flex gap="sm" wrap>
              <Button type="button" variant="outline" onClick={loadOlderPage}>
                過去を読み込む
              </Button>
              <Button type="button" variant="outline" onClick={receiveNewPost}>
                新着を受信
              </Button>
              <Button type="button" onClick={jumpToNewest} disabled={anchored}>
                最新へ移動
              </Button>
              {/* The stream itself carries no aria-live — a live region on a scroll container
                  re-announces on every reflow. The follow state belongs in its own small region. */}
              <Text size="xs" tone="muted" role="status">
                {anchored ? "最新に追従中" : "履歴を閲覧中（追従は停止）"}
              </Text>
            </Flex>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>anchorOffset（追従とみなす帯の広さ）</CardTitle>
            <CardDescription>
              既定は --scroll-area-anchor-offset（3rem）。0 を渡すと「完全に最下部」でなければ
              追従しません。行の高さが大きいサービスは theme 側でこのトークンを上げます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card variant="outline" className="h-40 w-full">
              <CardContent flush>
                <ScrollArea anchor="bottom" anchorOffset={0}>
                  <CardContent>
                    <Flex direction="col" gap="xs">
                      {entries.map((e) => (
                        <Text key={e} size="sm" className="tabular-nums">
                          {e}
                        </Text>
                      ))}
                    </Flex>
                  </CardContent>
                </ScrollArea>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>固定高さのリスト（縦スクロール）</CardTitle>
            <CardDescription>
              ラッパーに h-56 を指定すると、その高さがスクロール領域のビューポートになります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card variant="outline" className="h-56 w-full">
              <CardContent flush>
                <ScrollArea>
                  <CardContent>
                    <Flex direction="col" gap="xs">
                      {entries.map((e) => (
                        <div key={e} className="text-sm tabular-nums">
                          {e}
                        </div>
                      ))}
                    </Flex>
                  </CardContent>
                </ScrollArea>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ScrollArea</CardTitle>
            <CardDescription>orientation="horizontal"</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea orientation="horizontal">
              <ResponsiveGrid flow="columns">
                {columns.map((column) => (
                  <Card key={column}>
                    <CardContent solo>
                      <Text tabular>{column}</Text>
                    </CardContent>
                  </Card>
                ))}
              </ResponsiveGrid>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>両方向スクロール（orientation=&quot;both&quot;）</CardTitle>
            <CardDescription>
              縦にも横にも溢れうる面は orientation=&quot;both&quot;。以前は縦の ScrollArea に
              ScrollBar を足して横軸を開けていたが、スクロールはブラウザ本来のものになったので、
              軸を決めるのは orientation だけになった。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card variant="outline" className="h-32 w-full">
              <CardContent flush>
                <ScrollArea orientation="both">
                  <ResponsiveGrid flow="columns">
                    {columns.map((column) => (
                      <Text key={column}>{column}</Text>
                    ))}
                  </ResponsiveGrid>
                </ScrollArea>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>内容が収まる場合（バー非表示）</CardTitle>
            <CardDescription>
              中身が高さに収まるときはスクロールバーは表示されません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card variant="outline" className="h-56 w-full">
              <CardContent flush>
                <ScrollArea>
                  <CardContent>
                    <Flex direction="col" gap="xs">
                      {shortEntries.map((e) => (
                        <div key={e} className="text-sm tabular-nums">
                          {e}
                        </div>
                      ))}
                    </Flex>
                  </CardContent>
                </ScrollArea>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
