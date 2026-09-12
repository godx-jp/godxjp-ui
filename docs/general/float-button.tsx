import type { CSSProperties } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FloatButton, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { MessageCircle, Printer, Share2 } from "lucide-react";

/** One row up from the corner: the control's own height plus one stack step, both tokens. */
const STEP_UP = "calc(var(--space-stack-xl) + var(--control-height-lg) + var(--space-stack-md))";
/** Two rows up. */
const STEP_UP_TWICE =
  "calc(var(--space-stack-xl) + (var(--control-height-lg) + var(--space-stack-md)) * 2)";

/**
 * FloatButton — Ant Design のコーナーアクションを 100% 移植したもの（antd 6.6.3）。
 *
 * ページの内容ではないが常に手の届く場所にあるべき道具のための、ビューポートに固定された操作子。
 * `Button` はレイアウトの流れの中にあるので、隅に留めるには呼び出し側が `position: fixed` を書く
 * しかなく、それは `ui-audit` が止める（gh#558）。`Popover` はパネルの位置を決めるもので、
 * トリガーの位置は決めない。`Banner` は全幅の帯であって隅の印ではない。
 *
 * 隅までの距離は `--float-button-offset-block-end` / `--float-button-offset-inline-end`。
 * 下部に固定バーがあるサービスは、メディアクエリではなくトークン 1 つで印を動かす。
 *
 * このフレームは実際に固定表示される要素を含むため、画面の右下に印が重なって見える。
 * それが正しい姿で、そこが FloatButton の唯一の居場所である。
 */
export default function Demo() {
  return (
    <PageContainer
      title="FloatButton"
      subtitle="ビューポートの隅に固定される操作子 · Group と BackTop つき"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>単体のボタン</CardTitle>
            <CardDescription>
              画面右下に丸い印が 1 つ出ている。`tooltip` を文字列で渡すと、それがアクセシブル名にも
              なる —— アイコンだけの操作子に名前がないのは WCAG 4.1.2 違反であり、ツールチップは
              タッチの利用者には決して届かないため。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text size="sm" tone="muted">
                type=&quot;primary&quot; はブランド塗り、type=&quot;default&quot; は面とヘアライン。
                antd の語をそのまま使っている（この Library の他の場所では variant と呼ぶもの）。
              </Text>
              <Text size="sm" tone="muted">
                badge は count / dot / overflowCount / showZero を取る。count が overflowCount を
                超えると &quot;99+&quot; になる。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Group · 積み重ねか、1 つのトリガーの後ろか</CardTitle>
            <CardDescription>
              `trigger` がその切り替えスイッチ。渡さなければ全部のボタンが見えたままの素の積み重ね、
              渡せば子はトリガーの後ろに畳まれ、click か hover で開く。`placement` は top / left /
              right / bottom。left と right は `inset-inline-*` で解決されるので、
              dir=&quot;rtl&quot; では画面上の向きが正しく反転する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text size="sm" tone="muted">
              Group のルート要素は `pointer-events: none`、ボタンだけが `auto`。タッチ画面で、
              ボタンとボタンの隙間に落ちたスワイプがページのスクロールを殺さないため。
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>BackTop</CardTitle>
            <CardDescription>
              `visibilityHeight`（既定 400px）だけ下ったところで現れ、`duration`（既定 450ms）で
              上まで戻す。`prefers-reduced-motion` では瞬時に移動する（WCAG 2.3.3）。 `target`
              に「その要素を返す関数」を渡せば、document ではなくその要素を見張る —— 自前の
              スクロール領域を持つシェルの中でも使えるのはこのため。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text size="sm" tone="muted">
              `showProgress` を付けると、どこまで読んだかをリングで描く。1 フレームごとに変わる値は
              カスタムプロパティ 1 つだけで、呼び出し側に数値は 1 つも出てこない。
            </Text>
          </CardContent>
        </Card>
      </Flex>

      {/*
        実運用の画面に浮くボタンは 1 つである。このフレームは 3 つの形を同時に見せるため、
        2 つ目と 3 つ目を 1 段ずつ上にずらしてある —— そして、そのずらし方こそが gh#558 の求めた
        ものである: メディアクエリでも呼び出し側の px でもなく、トークンを 1 つ上書きするだけ。
        段の高さはボタンの高さ + 段間で、どちらもトークンなので密度を変えても崩れない。
      */}
      <FloatButton
        tooltip="アシスタントに聞く"
        type="primary"
        icon={<MessageCircle />}
        badge={{ count: 3 }}
      />

      <FloatButton.Group
        trigger="hover"
        placement="left"
        aria-label="その他の操作"
        style={
          {
            "--float-button-offset-block-end": STEP_UP,
          } as CSSProperties
        }
      >
        <FloatButton tooltip="共有" icon={<Share2 />} />
        <FloatButton tooltip="印刷" icon={<Printer />} />
      </FloatButton.Group>

      <FloatButton.BackTop
        visibilityHeight={0}
        showProgress
        style={
          {
            "--float-button-offset-block-end": STEP_UP_TWICE,
          } as CSSProperties
        }
      />
    </PageContainer>
  );
}
