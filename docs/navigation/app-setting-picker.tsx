import { AppProvider } from "@godxjp/ui/app";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * AppSettingPicker — ONE provider-bound Select for any single AppProvider setting,
 * chosen via `kind` (locale/timezone/date/time plus theme/brand/density/fontSize). It replaces the
 * former Locale/Timezone/Date-format/Time-format pickers (4 components → 1). Mount under
 * <AppProvider> and it reads/writes the matching context with NO value/onValueChange; pass
 * those to control it instead. Composed only from real @godxjp/ui components.
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
        title="AppSettingPicker"
        subtitle="kind で 1 つの AppProvider 設定を読み書きする統合ピッカー"
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle>kind で対象設定を選ぶ</CardTitle>
              <CardDescription>
                旧 Locale / Timezone / DateFormat / TimeFormat ピッカーを 1 コンポーネントに統合。
                &lt;AppProvider&gt; 配下に置くと value / onValueChange
                なしでコンテキストを読み書きする。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="row" gap="md" wrap>
                <Flex direction="col" gap="sm" className="min-w-40 flex-1">
                  <Text weight="medium">表示言語</Text>
                  <AppSettingPicker kind="locale" id="setting-locale" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-56 flex-1">
                  <Text weight="medium">タイムゾーン</Text>
                  <AppSettingPicker kind="timezone" id="setting-timezone" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-44 flex-1">
                  <Text weight="medium">日付フォーマット</Text>
                  <AppSettingPicker kind="dateFormat" id="setting-date-format" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-44 flex-1">
                  <Text weight="medium">時刻フォーマット</Text>
                  <AppSettingPicker kind="timeFormat" id="setting-time-format" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-36 flex-1">
                  <Text weight="medium">テーマ</Text>
                  <AppSettingPicker kind="theme" id="setting-theme" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-44 flex-1">
                  <Text weight="medium">ブランド</Text>
                  <AppSettingPicker kind="brand" id="setting-brand" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-40 flex-1">
                  <Text weight="medium">密度</Text>
                  <AppSettingPicker kind="density" id="setting-density" />
                </Flex>
                <Flex direction="col" gap="sm" className="min-w-36 flex-1">
                  <Text weight="medium">文字サイズ</Text>
                  <AppSettingPicker kind="fontSize" id="setting-font-size" />
                </Flex>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>狭いコンテナと長いラベル</CardTitle>
              <CardDescription>
                現行 API のモバイル挙動を 320px 相当で確認する。compact / icon-only API
                は未提供のため、この例では CSS で擬似実装しない。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-80 border p-3" lang="ja">
                <AppSettingPicker kind="timezone" id="setting-timezone-narrow" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>無効化</CardTitle>
              <CardDescription>disabled で操作を止める。</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="max-w-56">
                <Text weight="medium">タイムゾーン (disabled)</Text>
                <AppSettingPicker kind="timezone" id="setting-timezone-disabled" disabled />
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppProvider>
  );
}
