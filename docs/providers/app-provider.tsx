import { AppProvider } from "@godxjp/ui/app";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  DateFormatPicker,
  LocalePicker,
  TimeFormatPicker,
  TimezonePicker,
} from "@godxjp/ui/navigation";

/**
 * AppProvider — root locale/timezone/date-time context.
 * Mount ONCE at app root; every picker + formatDate reads from it automatically.
 * Pickers rendered here have NO controlled props — they read/write AppProvider context.
 * Composed only from real @godxjp/ui components.
 */
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
        title="AppProvider"
        subtitle="ロケール・タイムゾーン・日時フォーマットのコンテキストプロバイダー"
      >
        <Flex direction="col" gap="lg">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>概要</CardTitle>
              <CardDescription>
                AppProvider はアプリのルートに一度だけマウントする。 defaultLocale / defaultTimezone
                / defaultDateFormat / defaultTimeFormat を渡すと、 ツリー内のすべてのピッカーと
                formatDate がそのコンテキストを共有する。 persist=&#123;false&#125;
                はストーリーやテストで localStorage を使わない場合に指定。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                このデモ全体が{" "}
                <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                  &lt;AppProvider defaultLocale=&quot;ja&quot;
                  defaultTimezone=&quot;Asia/Tokyo&quot; defaultDateFormat=&quot;iso&quot;
                  defaultTimeFormat=&quot;24h&quot;&gt;
                </code>{" "}
                でラップされている。以下の各ピッカーはプロップなしでコンテキストを読み書きする。
              </p>
            </CardContent>
          </Card>

          {/* LocalePicker — uncontrolled */}
          <Card>
            <CardHeader>
              <CardTitle>LocalePicker — 言語選択</CardTitle>
              <CardDescription>
                value / onChange 不要。AppProvider の locale を自動で読み書きする。
                選択すると他のピッカーのラベル言語も切り替わる。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <label htmlFor="demo-locale" className="text-sm font-medium">
                  表示言語
                </label>
                <LocalePicker id="demo-locale" />
              </Flex>
            </CardContent>
          </Card>

          {/* TimezonePicker — uncontrolled */}
          <Card>
            <CardHeader>
              <CardTitle>TimezonePicker — タイムゾーン選択</CardTitle>
              <CardDescription>
                AppProvider の timezoneOptions を省略するとフル IANA リスト (~600 件) を表示。
                AppProvider に timezoneOptions を渡すと絞り込める。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <label htmlFor="demo-timezone" className="text-sm font-medium">
                  タイムゾーン
                </label>
                <TimezonePicker id="demo-timezone" />
              </Flex>
            </CardContent>
          </Card>

          {/* DateFormatPicker — uncontrolled */}
          <Card>
            <CardHeader>
              <CardTitle>DateFormatPicker — 日付フォーマット選択</CardTitle>
              <CardDescription>
                iso (yyyy-MM-dd) / dmy (dd/MM/yyyy) / mdy (MM/dd/yyyy) の 3 種から選択。 AppProvider
                の dateFormat コンテキストを読み書きし、 変更後の formatDate
                呼び出しに即時反映される。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <label htmlFor="demo-date-format" className="text-sm font-medium">
                  日付フォーマット
                </label>
                <DateFormatPicker id="demo-date-format" />
              </Flex>
            </CardContent>
          </Card>

          {/* TimeFormatPicker — uncontrolled */}
          <Card>
            <CardHeader>
              <CardTitle>TimeFormatPicker — 時刻フォーマット選択</CardTitle>
              <CardDescription>
                24h / 12h を選択。AppProvider の timeFormat コンテキストを読み書きする。 ja
                デフォルトは 24h。formatDate の time / datetime 出力に反映される。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <label htmlFor="demo-time-format" className="text-sm font-medium">
                  時刻フォーマット
                </label>
                <TimeFormatPicker id="demo-time-format" />
              </Flex>
            </CardContent>
          </Card>

          {/* All four pickers together */}
          <Card accent="primary">
            <CardHeader>
              <CardTitle>設定パネル — 4 ピッカーをまとめて配置</CardTitle>
              <CardDescription>
                ユーザー設定ページの典型パターン。AppProvider の中に 4 ピッカーをまとめて置くと
                それぞれがコンテキストを共有し、連動して動作する。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <Flex direction="row" gap="md" wrap>
                  <Flex direction="col" gap="sm" className="min-w-40 flex-1">
                    <label htmlFor="settings-locale" className="text-sm font-medium">
                      表示言語
                    </label>
                    <LocalePicker id="settings-locale" />
                  </Flex>
                  <Flex direction="col" gap="sm" className="min-w-56 flex-1">
                    <label htmlFor="settings-timezone" className="text-sm font-medium">
                      タイムゾーン
                    </label>
                    <TimezonePicker id="settings-timezone" />
                  </Flex>
                  <Flex direction="col" gap="sm" className="min-w-44 flex-1">
                    <label htmlFor="settings-date-format" className="text-sm font-medium">
                      日付フォーマット
                    </label>
                    <DateFormatPicker id="settings-date-format" />
                  </Flex>
                  <Flex direction="col" gap="sm" className="min-w-44 flex-1">
                    <label htmlFor="settings-time-format" className="text-sm font-medium">
                      時刻フォーマット
                    </label>
                    <TimeFormatPicker id="settings-time-format" />
                  </Flex>
                </Flex>
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppProvider>
  );
}
