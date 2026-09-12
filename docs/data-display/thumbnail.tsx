import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Thumbnail,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

import coverTerrain from "../assets/cover-terrain.svg";
import portraitIris from "../assets/portrait-iris.svg";
import shotLandscape from "../assets/shot-landscape.svg";
import shotPortrait from "../assets/shot-portrait.svg";

/* Committed SVG files under docs/assets, imported so the bundler rewrites each URL against
 * PREVIEW_BASE. A docs page must never fetch a third-party image: on CI the request never
 * settles, `networkidle` never fires, and the page load times out. */

/** Four DIFFERENT intrinsic ratios — the case AspectRatio cannot express with one number. */
const SHOTS = [
  { src: shotPortrait, width: 360, height: 640, alt: "モバイル版の一覧画面" },
  { src: shotLandscape, width: 960, height: 540, alt: "デスクトップ版のダッシュボード" },
  { src: coverTerrain, width: 480, height: 270, alt: "ストア掲載用のカバー画像" },
  { src: portraitIris, width: 96, height: 96, alt: "アプリアイコン" },
];

/**
 * Thumbnail — 高さは固定、幅は画像そのものの比率。囲みは画像に直接かかる hairline。
 *
 * AspectRatio は比率を固定して幅 100% に広げるので、比率の違う数枚を並べるとレターボックスか
 * 切り抜きになる。Avatar は人・組織の識別マーク、Card は囲みと画像のあいだに padding を入れる、
 * CardCover は Card の中のスロット。Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Thumbnail" subtitle="高さ固定・幅は実寸比 · 画像に直接かかる hairline">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>比率の違う画像を 1 行に並べる</CardTitle>
            <CardDescription>
              縦長・横長・ワイド・正方形が同じ行に並んでも、高さはそろい、幅はそれぞれの比率の
              まま。切り抜きもレターボックスも起きません。狭い画面では折り返します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="sm" wrap align="start">
              {SHOTS.map((shot) => (
                <Thumbnail key={shot.alt} size="lg" {...shot} />
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>size · sm · md（既定）· lg</CardTitle>
            <CardDescription>
              sm 64px は添付ファイルの行に、md 96px はギャラリー行に、lg 160px は画像そのものが
              本文である審査画面に。px 指定はありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex gap="sm" wrap align="start">
                <Thumbnail size="sm" {...SHOTS[0]} />
                <Thumbnail size="sm" {...SHOTS[1]} />
              </Flex>
              <Flex gap="sm" wrap align="start">
                <Thumbnail {...SHOTS[0]} />
                <Thumbnail {...SHOTS[1]} />
              </Flex>
              <Flex gap="sm" wrap align="start">
                <Thumbnail size="lg" {...SHOTS[0]} />
                <Thumbnail size="lg" {...SHOTS[1]} />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>読み込み前に幅を確保する</CardTitle>
            <CardDescription>
              幅が実寸比のままということは、画像が届くまで幅が決まらないということでもあります。
              元ファイルの width / height をそのまま渡すと、ブラウザが比率を先に知るので、
              高さが固定されている分だけ最初の描画から最終的な幅になります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="sm" wrap align="start">
              <Thumbnail
                src={shotPortrait}
                width={360}
                height={640}
                alt="幅を先に確保した縦長の画面"
              />
              <Thumbnail
                src={shotLandscape}
                width={960}
                height={540}
                alt="幅を先に確保した横長の画面"
                loading="lazy"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>alt は省略できない</CardTitle>
            <CardDescription>
              型の上で必須です。ページが既に述べていることしか写っていない画像には alt=&quot;&quot;
              を渡します —— 空文字は著者が下す「決定」で、属性そのものを書き忘れるのとは違います
              （WCAG 1.1.1）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="sm" wrap align="start">
              <Thumbnail src={coverTerrain} width={480} height={270} alt="" />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
