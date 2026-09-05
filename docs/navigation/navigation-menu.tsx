import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@godxjp/ui/navigation";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { Text } from "@godxjp/ui/general";

/**
 * NavigationMenu — 水平ナビゲーションメニュー。Trigger でドロップダウン展開、
 * Link で直接ページ遷移。NavigationMenu > NavigationMenuList >
 * NavigationMenuItem > Trigger + Content で構成。Viewport で浮動パネルを制御。
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="NavigationMenu"
      subtitle="水平ナビゲーション · トリガー展開コンテンツ・リンク・ビューポートをサポート"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>会計モジュールナビゲーション</CardTitle>
            <CardDescription>
              各メニュートリガーをホバーするとコンテンツパネルが展開します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>会計</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {/* ui-audit-disable-next-line no-arbitrary-size — NavigationMenu flyout panel width (demo layout) */}
                    <ResponsiveGrid columns={{ sm: 1, md: 2 }} gap="sm" className="md:w-[400px]">
                      <NavigationMenuLink href="#" className="hover:bg-accent block rounded-md">
                        <CardContent>
                          <Flex direction="col" gap="xs">
                            <Text as="div" weight="medium">
                              仕訳入力
                            </Text>
                            <Text as="p" size="xs" tone="muted">
                              借方・貸方を直接入力して仕訳を作成します。
                            </Text>
                          </Flex>
                        </CardContent>
                      </NavigationMenuLink>
                      <NavigationMenuLink href="#" className="hover:bg-accent block rounded-md">
                        <CardContent>
                          <Flex direction="col" gap="xs">
                            <Text as="div" weight="medium">
                              仕訳帳
                            </Text>
                            <Text as="p" size="xs" tone="muted">
                              全仕訳の一覧・検索・フィルタリング。
                            </Text>
                          </Flex>
                        </CardContent>
                      </NavigationMenuLink>
                      <NavigationMenuLink href="#" className="hover:bg-accent block rounded-md">
                        <CardContent>
                          <Flex direction="col" gap="xs">
                            <Text as="div" weight="medium">
                              総勘定元帳
                            </Text>
                            <Text as="p" size="xs" tone="muted">
                              勘定科目ごとの残高・取引履歴。
                            </Text>
                          </Flex>
                        </CardContent>
                      </NavigationMenuLink>
                      <NavigationMenuLink href="#" className="hover:bg-accent block rounded-md">
                        <CardContent>
                          <Flex direction="col" gap="xs">
                            <Text as="div" weight="medium">
                              試算表
                            </Text>
                            <Text as="p" size="xs" tone="muted">
                              期間指定で借方・貸方の合計を確認。
                            </Text>
                          </Flex>
                        </CardContent>
                      </NavigationMenuLink>
                    </ResponsiveGrid>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>レポート</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {/* ui-audit-disable-next-line no-arbitrary-size — NavigationMenu flyout panel width (demo layout) */}
                    <ResponsiveGrid columns={1} gap="sm" className="md:w-[360px]">
                      <NavigationMenuLink href="#" className="hover:bg-accent block rounded-md">
                        <CardContent>
                          <Flex direction="col" gap="xs">
                            <Text as="div" weight="medium">
                              貸借対照表
                            </Text>
                            <Text as="p" size="xs" tone="muted">
                              特定日時点の資産・負債・純資産。
                            </Text>
                          </Flex>
                        </CardContent>
                      </NavigationMenuLink>
                      <NavigationMenuLink href="#" className="hover:bg-accent block rounded-md">
                        <CardContent>
                          <Flex direction="col" gap="xs">
                            <Text as="div" weight="medium">
                              損益計算書
                            </Text>
                            <Text as="p" size="xs" tone="muted">
                              期間中の収益・費用・利益の要約。
                            </Text>
                          </Flex>
                        </CardContent>
                      </NavigationMenuLink>
                      <NavigationMenuLink href="#" className="hover:bg-accent block rounded-md">
                        <CardContent>
                          <Flex direction="col" gap="xs">
                            <Text as="div" weight="medium">
                              キャッシュフロー計算書
                            </Text>
                            <Text as="p" size="xs" tone="muted">
                              営業・投資・財務活動別の資金移動。
                            </Text>
                          </Flex>
                        </CardContent>
                      </NavigationMenuLink>
                    </ResponsiveGrid>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="#" className="text-sm font-medium">
                    マスタ管理
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink href="#" className="text-sm font-medium">
                    設定
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
              <NavigationMenuViewport />
            </NavigationMenu>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
