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
import { Flex, PageContainer } from "@godxjp/ui/layout";

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
      subtitle="水平ナビゲーション — トリガー展開コンテンツ・リンク・ビューポートをサポート"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>会計モジュールナビゲーション</CardTitle>
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
                    <ul className="grid gap-2 p-4 md:w-[400px] md:grid-cols-2">
                      <li>
                        <NavigationMenuLink
                          href="#"
                          className="hover:bg-accent block rounded-md p-3"
                        >
                          <div className="text-sm font-medium">仕訳入力</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            借方・貸方を直接入力して仕訳を作成します。
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink
                          href="#"
                          className="hover:bg-accent block rounded-md p-3"
                        >
                          <div className="text-sm font-medium">仕訳帳</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            全仕訳の一覧・検索・フィルタリング。
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink
                          href="#"
                          className="hover:bg-accent block rounded-md p-3"
                        >
                          <div className="text-sm font-medium">総勘定元帳</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            勘定科目ごとの残高・取引履歴。
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink
                          href="#"
                          className="hover:bg-accent block rounded-md p-3"
                        >
                          <div className="text-sm font-medium">試算表</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            期間指定で借方・貸方の合計を確認。
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>レポート</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-4 md:w-[360px]">
                      <li>
                        <NavigationMenuLink
                          href="#"
                          className="hover:bg-accent block rounded-md p-3"
                        >
                          <div className="text-sm font-medium">貸借対照表</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            特定日時点の資産・負債・純資産。
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink
                          href="#"
                          className="hover:bg-accent block rounded-md p-3"
                        >
                          <div className="text-sm font-medium">損益計算書</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            期間中の収益・費用・利益の要約。
                          </p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink
                          href="#"
                          className="hover:bg-accent block rounded-md p-3"
                        >
                          <div className="text-sm font-medium">キャッシュフロー計算書</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            営業・投資・財務活動別の資金移動。
                          </p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
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
