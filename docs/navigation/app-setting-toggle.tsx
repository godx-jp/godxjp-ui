import { AppProvider } from "@godxjp/ui/app";
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, Topbar } from "@godxjp/ui/layout";
import { AppSettingToggle } from "@godxjp/ui/navigation";

/**
 * AppSettingToggle — ONE button that steps a single AppProvider setting to its next value and
 * shows that value as its glyph. The no-menu counterpart to AppSettingPicker: same binding
 * contract, same option order, one tap instead of open-then-choose. `appearance="bar"` (the
 * default) is a CELL of the bar — full bar height, the bar's own hover surface, square corners.
 */
export default function Demo() {
  return (
    <AppProvider defaultLocale="ja" defaultTimeFormat="24h" persist={false}>
      <PageContainer
        title="AppSettingToggle"
        subtitle="押すたびに次の値へ送る 1 ボタン。ドロップダウンなし。"
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle level={2}>トップバーのセル（既定）</CardTitle>
              <CardDescription>
                appearance=&quot;bar&quot; はバーの一部として全高で伸び、角は
                --topbar-item-radius。--control-height の錠剤がバーの中に浮くことはない。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Topbar
                start={
                  <Avatar className="rounded-md">
                    <AvatarFallback>G</AvatarFallback>
                  </Avatar>
                }
                end={
                  <>
                    <AppSettingToggle kind="theme" id="topbar-theme-toggle" />
                    <AppSettingToggle kind="density" id="topbar-density-toggle" />
                    <AppSettingToggle kind="fontSize" id="topbar-font-size-toggle" />
                    <AppSettingToggle kind="timeFormat" id="topbar-time-format-toggle" />
                  </>
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>バー以外（appearance=&quot;icon&quot;）</CardTitle>
              <CardDescription>
                設定行やカードヘッダーなど、バーではない場所。--control-height
                の正方形ゴーストボタン。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="row" gap="md" align="center" wrap>
                <Flex direction="row" gap="sm" align="center">
                  <Text weight="medium">テーマ</Text>
                  <AppSettingToggle kind="theme" appearance="icon" id="icon-theme-toggle" />
                </Flex>
                <Flex direction="row" gap="sm" align="center">
                  <Text weight="medium">時刻形式</Text>
                  <AppSettingToggle
                    kind="timeFormat"
                    appearance="icon"
                    id="icon-time-format-toggle"
                  />
                </Flex>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>制御モードと無効化</CardTitle>
              <CardDescription>
                value + onValueChange で外部状態に紐づけ、disabled で操作を止める。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="row" gap="md" align="center">
                <AppSettingToggle
                  kind="density"
                  appearance="icon"
                  value="comfortable"
                  onValueChange={() => {}}
                  id="controlled-density-toggle"
                />
                <AppSettingToggle
                  kind="theme"
                  appearance="icon"
                  disabled
                  id="disabled-theme-toggle"
                />
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppProvider>
  );
}
