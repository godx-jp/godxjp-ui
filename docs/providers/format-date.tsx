import { AppProvider } from "@godxjp/ui/app";
import { formatDate } from "@godxjp/ui/datetime";
import { Text } from "@godxjp/ui/general";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * formatDate — MANDATORY date/time display function from @godxjp/ui/datetime.
 * Reads locale, timezone, dateFormat, and timeFormat from AppProvider context.
 * NEVER call date-fns or Intl.DateTimeFormat directly; use formatDate instead.
 * Composed only from real @godxjp/ui components. All inputs are fixed ISO strings.
 */

const ISO_DATE = "2024-04-12";
const ISO_DATETIME = "2024-04-12T09:30:00+09:00";
const HH_MM = "09:30";
const PAST_DATETIME = "2024-01-15T14:45:00+09:00";
const NULL_VALUE = null;

export default function Demo() {
  return (
    <AppProvider
      defaultLocale="ja"
      defaultTimezone="Asia/Tokyo"
      defaultDateFormat="iso"
      defaultTimeFormat="24h"
      persist={false}
    >
      <PageContainer
        title="formatDate"
        subtitle="日付・時刻・相対表示の統一フォーマット関数 — AppProvider コンテキストを自動参照"
      >
        <Flex direction="col" gap="lg">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>概要</CardTitle>
              <CardDescription>
                formatDate は @godxjp/ui/datetime からインポートする関数。 AppProvider の locale /
                timezone / dateFormat / timeFormat を読み取り、 null / undefined を渡すと em-dash
                (&mdash;) を返す。 date-fns や Intl.DateTimeFormat を直接呼ばないこと。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text as="p" tone="muted">
                このデモは{" "}
                <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                  defaultLocale=&quot;ja&quot; defaultTimezone=&quot;Asia/Tokyo&quot;
                  defaultDateFormat=&quot;iso&quot; defaultTimeFormat=&quot;24h&quot;
                </code>{" "}
                の AppProvider でラップされている。
              </Text>
            </CardContent>
          </Card>

          {/* kind: "date" */}
          <Card>
            <CardHeader>
              <CardTitle>kind: &quot;date&quot; — 日付のみ</CardTitle>
              <CardDescription>
                ISO yyyy-MM-dd を渡すと auto で &quot;date&quot; と判定されるが、 kind:
                &quot;date&quot; を明示すると ISO datetime 文字列でも日付部分だけを表示できる。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Descriptions columns={2}>
                <Descriptions.Item label="入力値" mono>
                  {ISO_DATE}
                </Descriptions.Item>
                <Descriptions.Item label="kind">&quot;date&quot;</Descriptions.Item>
                <Descriptions.Item label="出力" mono span={2}>
                  {formatDate(ISO_DATE, { kind: "date" })}
                </Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>

          {/* kind: "time" */}
          <Card>
            <CardHeader>
              <CardTitle>kind: &quot;time&quot; — 時刻のみ</CardTitle>
              <CardDescription>
                HH:mm 文字列は auto-detection で &quot;time&quot; と判定される。 AppProvider の
                timeFormat (24h / 12h) に従い出力が切り替わる。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Descriptions columns={2}>
                <Descriptions.Item label="入力値" mono>
                  {HH_MM}
                </Descriptions.Item>
                <Descriptions.Item label="kind">&quot;time&quot;</Descriptions.Item>
                <Descriptions.Item label="出力 (24h)" mono span={2}>
                  {formatDate(HH_MM, { kind: "time" })}
                </Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>

          {/* kind: "datetime" */}
          <Card>
            <CardHeader>
              <CardTitle>kind: &quot;datetime&quot; — 日時</CardTitle>
              <CardDescription>
                ISO datetime 文字列を渡すと auto-detection で &quot;datetime&quot; と判定される。
                取引タイムスタンプや更新日時の表示に使用する。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Descriptions columns={2}>
                <Descriptions.Item label="入力値" mono span={2}>
                  {ISO_DATETIME}
                </Descriptions.Item>
                <Descriptions.Item label="kind">&quot;datetime&quot;</Descriptions.Item>
                <Descriptions.Item label="出力" mono>
                  {formatDate(ISO_DATETIME, { kind: "datetime" })}
                </Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>

          {/* kind: "long" */}
          <Card>
            <CardHeader>
              <CardTitle>kind: &quot;long&quot; — 長形式 (PPP)</CardTitle>
              <CardDescription>
                モーダルや詳細パネルで年月日を読みやすく表示するときに使う。
                ロケールに合わせた月名や曜日を含む完全形式で出力される。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Descriptions columns={2}>
                <Descriptions.Item label="入力値" mono>
                  {ISO_DATE}
                </Descriptions.Item>
                <Descriptions.Item label="kind">&quot;long&quot;</Descriptions.Item>
                <Descriptions.Item label="出力" mono span={2}>
                  {formatDate(ISO_DATE, { kind: "long" })}
                </Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>

          {/* kind: "relative" */}
          <Card>
            <CardHeader>
              <CardTitle>kind: &quot;relative&quot; — 相対表示</CardTitle>
              <CardDescription>
                アクティビティフィードや監査ログで &quot;3日前&quot; のような相対表現を出力する。
                ロケールに応じた文字列 (ja: &quot;3日前&quot; / en: &quot;3 days ago&quot;) になる。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Descriptions columns={2}>
                <Descriptions.Item label="入力値" mono span={2}>
                  {PAST_DATETIME}
                </Descriptions.Item>
                <Descriptions.Item label="kind">&quot;relative&quot;</Descriptions.Item>
                <Descriptions.Item label="出力" mono>
                  {formatDate(PAST_DATETIME, { kind: "relative" })}
                </Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>

          {/* null / undefined handling */}
          <Card>
            <CardHeader>
              <CardTitle>null / undefined — em-dash フォールバック</CardTitle>
              <CardDescription>
                null / undefined / 空文字を渡すと em-dash (&mdash;) を返す。
                呼び出し前に三項演算子でガードする必要はない。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Descriptions columns={2}>
                <Descriptions.Item label="入力値" mono>
                  null
                </Descriptions.Item>
                <Descriptions.Item label="kind">(省略)</Descriptions.Item>
                <Descriptions.Item label="出力" mono span={2}>
                  {formatDate(NULL_VALUE)}
                </Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>

          {/* Summary table */}
          <Card>
            <CardHeader>
              <CardTitle>kind オプション一覧</CardTitle>
              <CardDescription>
                各 kind と対応する入力・出力の早見表。auto は入力値の形式から自動判定する。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Descriptions columns={3}>
                <Descriptions.Item label='kind: "date"' mono>
                  {formatDate(ISO_DATE, { kind: "date" })}
                </Descriptions.Item>
                <Descriptions.Item label='kind: "time"' mono>
                  {formatDate(HH_MM, { kind: "time" })}
                </Descriptions.Item>
                <Descriptions.Item label='kind: "datetime"' mono>
                  {formatDate(ISO_DATETIME, { kind: "datetime" })}
                </Descriptions.Item>
                <Descriptions.Item label='kind: "long"' mono>
                  {formatDate(ISO_DATE, { kind: "long" })}
                </Descriptions.Item>
                <Descriptions.Item label='kind: "relative"' mono>
                  {formatDate(PAST_DATETIME, { kind: "relative" })}
                </Descriptions.Item>
                <Descriptions.Item label='kind: "auto" (省略時)' mono>
                  {formatDate(ISO_DATE)}
                </Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppProvider>
  );
}
