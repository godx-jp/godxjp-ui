import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
  Progress,
  Thumbnail,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Download, ExternalLink, FileText } from "lucide-react";

/**
 * Descriptions — the label/value grid every detail page is made of.
 *
 * WHY THIS PAGE IS LONG. It was five tidy cards of short strings, and the owner's verdict was that
 * it shows nothing about whether the component holds up. That is right: a label/value grid is
 * trivial when every label is four characters and every value is one line.
 *
 * A real detail screen is not that. It has a label that runs to three lines beside one that is two
 * characters; a value that is an image, a file to download, a link, a status, a progress bar, a
 * 40-character machine ID, or nothing at all; and it has to survive all of them in the same grid,
 * at every breakpoint, bordered and not.
 *
 * So every section below is a case a real detail page hits. Where a section looks bad, the
 * component owes an answer — the sample data is not there to flatter it.
 */
const ID = "01JBQ9X7M4K2R8VT3NZ6YHF0PA";

export default function Demo() {
  return (
    <PageContainer
      title="Descriptions"
      subtitle="label/value grid — every shape a detail page asks for"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>1 · columns × bordered × layout — the three axes</CardTitle>
            <CardDescription>
              Every combination changes where the label sits and how the grid divides. These are the
              four a project actually picks between.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  columns=3 · bordered · horizontal — the dense admin default
                </Text>
                <Descriptions columns={3} bordered layout="horizontal">
                  <Descriptions.Item label="取引先">株式会社山田製作所</Descriptions.Item>
                  <Descriptions.Item label="担当">佐藤 玲</Descriptions.Item>
                  <Descriptions.Item label="状態">
                    <Badge tone="success">有効</Badge>
                  </Descriptions.Item>
                  <Descriptions.Item label="登録日">2024-04-01</Descriptions.Item>
                  <Descriptions.Item label="与信枠">¥12,000,000</Descriptions.Item>
                  <Descriptions.Item label="支払条件">月末締め翌月末払い</Descriptions.Item>
                </Descriptions>
              </Flex>

              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  columns=2 · no border · vertical — the reading layout, label above value
                </Text>
                <Descriptions columns={2} layout="vertical">
                  <Descriptions.Item label="取引先">株式会社山田製作所</Descriptions.Item>
                  <Descriptions.Item label="担当">佐藤 玲</Descriptions.Item>
                  <Descriptions.Item label="与信枠">¥12,000,000</Descriptions.Item>
                  <Descriptions.Item label="支払条件">月末締め翌月末払い</Descriptions.Item>
                </Descriptions>
              </Flex>

              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  columns=1 · bordered — a narrow column or a phone
                </Text>
                <Descriptions columns={1} bordered>
                  <Descriptions.Item label="取引先">株式会社山田製作所</Descriptions.Item>
                  <Descriptions.Item label="状態">
                    <Badge tone="success">有効</Badge>
                  </Descriptions.Item>
                </Descriptions>
              </Flex>

              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  labelAlign=end — right-aligned labels, so the values start on one line
                </Text>
                <Descriptions columns={2} bordered labelAlign="end">
                  <Descriptions.Item label="ID">{ID}</Descriptions.Item>
                  <Descriptions.Item label="状態">
                    <Badge tone="success">有効</Badge>
                  </Descriptions.Item>
                </Descriptions>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>2 · responsive columns</CardTitle>
            <CardDescription>
              `columns` takes a breakpoint object. Narrow this frame with the Dimensions control: 1
              column on a phone, 2 on a tablet, 3 on a desktop — the same markup throughout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions columns={{ sm: 1, md: 2, lg: 3 }} bordered>
              <Descriptions.Item label="会社名">株式会社山田製作所</Descriptions.Item>
              <Descriptions.Item label="法人番号" mono>
                7010001071491
              </Descriptions.Item>
              <Descriptions.Item label="業種">精密機器製造</Descriptions.Item>
              <Descriptions.Item label="代表">山田 太郎</Descriptions.Item>
              <Descriptions.Item label="従業員数">248 名</Descriptions.Item>
              <Descriptions.Item label="設立">1974-06-12</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>3 · the value is not a string</CardTitle>
            <CardDescription>
              The value slot takes any node. These are the ones a detail page actually puts there —
              an image, a file, a link, a status, a proportion, a secret, money, a long memo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions columns={{ sm: 1, md: 2 }} bordered>
              <Descriptions.Item label="製品画像">
                <Thumbnail src="/godxjp-ui/favicon.svg" alt="製品サムネイル" size="md" />
              </Descriptions.Item>
              <Descriptions.Item label="状態">
                <Flex direction="row" gap="xs" wrap>
                  <Badge tone="success">出荷可</Badge>
                  <Badge tone="warning" variant="outline">
                    在庫僅少
                  </Badge>
                </Flex>
              </Descriptions.Item>
              <Descriptions.Item label="仕様書">
                <Button variant="outline" size="sm">
                  <FileText className="size-4" />
                  仕様書_v4.2.pdf
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="検査成績書">
                <Button variant="ghost" size="sm">
                  <Download className="size-4" />
                  ダウンロード（2.4 MB）
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="外部リンク">
                <Button variant="link" size="sm">
                  <ExternalLink className="size-4" />
                  サプライヤーポータル
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="検収進捗">
                <Progress value={72} tone="success" label="検収進捗 72%" />
              </Descriptions.Item>
              <Descriptions.Item label="単価">¥128,400</Descriptions.Item>
              <Descriptions.Item label="ロットID" mono>
                {ID}
              </Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>4 · span — a value that needs the whole row</CardTitle>
            <CardDescription>
              An address, a memo or a JSON blob does not belong in a one-third cell. `span` widens
              the item; `span=&quot;filled&quot;` takes whatever is left on the row, so the grid
              stays aligned instead of leaving a hole.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions columns={3} bordered>
              <Descriptions.Item label="取引先">株式会社山田製作所</Descriptions.Item>
              <Descriptions.Item label="担当">佐藤 玲</Descriptions.Item>
              <Descriptions.Item label="電話">03-5555-0198</Descriptions.Item>
              <Descriptions.Item label="本社所在地" span={3}>
                〒105-0011 東京都港区芝公園四丁目2番8号 東京タワー内 グローバルビジネスセンター 23F
                株式会社山田製作所 東日本統括本部
              </Descriptions.Item>
              <Descriptions.Item label="備考" span="filled">
                検収は毎月第2・第4火曜のみ。祝日と重なる場合は翌営業日に振替。先方の受入窓口は
                資材部・資材管理課（内線
                4821）。2026年4月以降は電子取引のみとなるため、紙の納品書は不可。
              </Descriptions.Item>
              <Descriptions.Item label="与信枠">¥12,000,000</Descriptions.Item>
              <Descriptions.Item label="使用中">¥8,214,930</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>5 · the cases that break a label/value grid</CardTitle>
            <CardDescription>
              This is the only section on the page that can tell you whether Descriptions is any
              good. If a row here looks wrong, the component owes an answer — not the data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions columns={{ sm: 1, md: 2, lg: 3 }} bordered>
              <Descriptions.Item label="グローバル人事情報基盤・従業員セルフサービスポータル（アジア太平洋地域）連携ステータス">
                <Badge tone="success">連携済</Badge>
              </Descriptions.Item>
              <Descriptions.Item label="率">96.8%</Descriptions.Item>
              <Descriptions.Item label="ID" mono>
                urn:godx:entitlement:ap-northeast-1:7010001071491:workforce/identity/administration/v4
              </Descriptions.Item>
              <Descriptions.Item label="未設定">
                <Text tone="muted">—</Text>
              </Descriptions.Item>
              <Descriptions.Item label="空文字">{""}</Descriptions.Item>
              <Descriptions.Item label="ゼロ">0</Descriptions.Item>
              <Descriptions.Item label="累計取扱高">¥128,400,932,517</Descriptions.Item>
              <Descriptions.Item label="差引">−¥412,880</Descriptions.Item>
              <Descriptions.Item label="長い英数字" mono>
                AKIAIOSFODNN7EXAMPLEWJALRXUTNFEMIK7MDENGBPXRFICYEXAMPLEKEY
              </Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>使い方の要点</CardTitle>
            <CardDescription>この3点で、上のほとんどが決まります。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text as="div" size="sm">
                直下の子は <code>Descriptions.Item</code> だけです。生の <code>&lt;div&gt;</code> や
                <code>&lt;dt&gt;/&lt;dd&gt;</code> を混ぜるとグリッドが崩れます。
              </Text>
              <Text as="div" size="sm">
                機械可読な値（ID・パス・鍵・通貨コード）には <code>mono</code> を付けてください。
                等幅になるだけでなく <code>break-all</code> が効き、上の 57
                文字の鍵がセルを突き破らずに折り返します。
              </Text>
              <Text as="div" size="sm">
                住所・備考・JSON のような長い値には <code>span</code> を。 1/3
                セルに押し込むと、その行だけ高さが跳ねて表全体が読みにくくなります。
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
