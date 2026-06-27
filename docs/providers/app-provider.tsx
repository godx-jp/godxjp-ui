import { AppProvider } from "@godxjp/ui/app";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Label } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * AppProvider · root locale/timezone/date-time context.
 * Mount ONCE at app root; every AppSettingPicker + formatDate reads from it automatically.
 * AppSettingPicker rendered here has NO value/onValueChange · it reads/writes AppProvider
 * context for the setting named by `kind`. Composed only from real @godxjp/ui components.
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
          <Card>
            <CardHeader>
              <CardTitle>概要</CardTitle>
              <CardDescription>
                AppProvider はアプリのルートに一度だけマウントする。defaultLocale / defaultTimezone
                / defaultDateFormat / defaultTimeFormat を渡すと、ツリー内のすべての
                AppSettingPicker と formatDate がそのコンテキストを共有する。persist=false
                はストーリーやテストで localStorage を使わない場合に指定。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text as="p" tone="muted">
                このデモ全体が AppProvider でラップされており、以下の各 AppSettingPicker は value /
                onValueChange なしでコンテキストを読み書きする。
              </Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>kind=locale · 言語選択</CardTitle>
              <CardDescription>
                AppProvider の locale を自動で読み書きする。選択すると他の AppSettingPicker
                のラベル言語も切り替わる。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <Label htmlFor="demo-locale">表示言語</Label>
                <AppSettingPicker kind="locale" id="demo-locale" />
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>kind=timezone · タイムゾーン選択</CardTitle>
              <CardDescription>
                AppProvider の timezoneOptions を省略するとフル IANA リスト（約 600
                件）を表示。timezoneOptions を渡すと絞り込める。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <Label htmlFor="demo-timezone">タイムゾーン</Label>
                <AppSettingPicker kind="timezone" id="demo-timezone" />
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>kind=dateFormat · 日付フォーマット選択</CardTitle>
              <CardDescription>
                iso（yyyy-MM-dd）/ dmy（dd/MM/yyyy）/ mdy（MM/dd/yyyy）の 3 種から選択。dateFormat
                コンテキストを読み書きし、以後の formatDate 呼び出しに即時反映される。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <Label htmlFor="demo-date-format">日付フォーマット</Label>
                <AppSettingPicker kind="dateFormat" id="demo-date-format" />
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>kind=timeFormat · 時刻フォーマット選択</CardTitle>
              <CardDescription>
                24h / 12h を選択。timeFormat コンテキストを読み書きする。ja デフォルトは
                24h。formatDate の time / datetime 出力に反映される。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <Label htmlFor="demo-time-format">時刻フォーマット</Label>
                <AppSettingPicker kind="timeFormat" id="demo-time-format" />
              </Flex>
            </CardContent>
          </Card>

          <Card accent="primary">
            <CardHeader>
              <CardTitle>設定パネル · 4 つの設定をまとめて配置</CardTitle>
              <CardDescription>
                ユーザー設定ページの典型パターン。AppProvider の中に kind 違いの AppSettingPicker
                を並べると、それぞれがコンテキストを共有して連動する。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="row" gap="md" wrap>
                <Flex direction="col" gap="sm" className="min-w-40 flex-1">
                  <Label htmlFor="settings-locale">表示言語</Label>
                  <AppSettingPicker kind="locale" id="settings-locale" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-56 flex-1">
                  <Label htmlFor="settings-timezone">タイムゾーン</Label>
                  <AppSettingPicker kind="timezone" id="settings-timezone" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-44 flex-1">
                  <Label htmlFor="settings-date-format">日付フォーマット</Label>
                  <AppSettingPicker kind="dateFormat" id="settings-date-format" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-44 flex-1">
                  <Label htmlFor="settings-time-format">時刻フォーマット</Label>
                  <AppSettingPicker kind="timeFormat" id="settings-time-format" />
                </Flex>
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppProvider>
  );
}
