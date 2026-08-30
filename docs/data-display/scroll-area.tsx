import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ScrollArea,
  ScrollBar,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * ScrollArea — custom scrollbar container. ALWAYS set an explicit height/max-height
 * (vertical) or width (horizontal) on the wrapper or the scrollbar never appears.
 * `type` controls when the bar is visible; `ScrollBar orientation="horizontal"`
 * adds a horizontal bar. Composed only from real @godxjp/ui components.
 */
const entries = Array.from(
  { length: 18 },
  (_, i) => `仕訳 #2024-${String(312 - i).padStart(4, "0")}`,
);

const shortEntries = entries.slice(0, 3);

/**
 * The live-stream screen (gh#311). A deterministic clock: the demo never reads `Date.now()`, so the
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
      subtitle="Custom scrollbar container · needs an explicit height"
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
            <ScrollArea
              anchor="bottom"
              viewportRef={streamViewport}
              onAnchoredChange={setAnchored}
              type="always"
              className="border-border h-64 w-full rounded-md border"
            >
              <Flex direction="col" className="px-3">
                {posts.map((post) => (
                  <Flex key={post.id} direction="col" className="py-2">
                    <Flex gap="sm" align="baseline">
                      <Text size="sm" weight="medium">
                        {post.author}
                      </Text>
                      <Text size="xs" tone="muted">
                        {timeFormatter.format(new Date(STREAM_EPOCH + post.id * STREAM_STEP_MS))}
                      </Text>
                    </Flex>
                    <Text size="sm" tone="muted">
                      {post.body}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </ScrollArea>
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
            <ScrollArea
              anchor="bottom"
              anchorOffset={0}
              type="always"
              className="border-border h-40 w-full rounded-md border"
            >
              <Flex direction="col" gap="xs" className="p-3">
                {entries.map((e) => (
                  <Text key={e} size="sm" className="tabular-nums">
                    {e}
                  </Text>
                ))}
              </Flex>
            </ScrollArea>
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
            <ScrollArea className="border-border h-56 w-full rounded-md border">
              <Flex direction="col" gap="xs" className="p-3">
                {entries.map((e) => (
                  <div key={e} className="text-sm tabular-nums">
                    {e}
                  </div>
                ))}
              </Flex>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>type=&quot;always&quot;（バーを常時表示）</CardTitle>
            <CardDescription>
              既定の hover はホバー時のみバーを表示します。always
              は内容が溢れる限りバーを常に表示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea type="always" className="border-border h-56 w-full rounded-md border">
              <Flex direction="col" gap="xs" className="p-3">
                {entries.map((e) => (
                  <div key={e} className="text-sm tabular-nums">
                    {e}
                  </div>
                ))}
              </Flex>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              横スクロール（ScrollBar orientation=&quot;horizontal&quot;）
            </CardTitle>
            <CardDescription>
              横方向のバーは明示的に ScrollBar
              を子要素として配置します。中身は幅を指定して溢れさせます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="border-border w-full rounded-md border">
              <Flex gap="lg" className="w-max p-3">
                {columns.map((c) => (
                  <div key={c} className="text-sm whitespace-nowrap tabular-nums">
                    {c}
                  </div>
                ))}
              </Flex>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
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
            <ScrollArea type="always" className="border-border h-56 w-full rounded-md border">
              <Flex direction="col" gap="xs" className="p-3">
                {shortEntries.map((e) => (
                  <div key={e} className="text-sm tabular-nums">
                    {e}
                  </div>
                ))}
              </Flex>
            </ScrollArea>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
