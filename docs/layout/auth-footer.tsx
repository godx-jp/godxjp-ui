import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { AuthFooter, AuthStack, PageContainer } from "@godxjp/ui/layout";

/**
 * AuthFooter — shared hosted-identity legal line. Every item remains consumer-owned React content,
 * allowing real links and locale controls without the layout component inventing navigation.
 */
export default function Demo() {
  return (
    <PageContainer title="AuthFooter" subtitle="製品名 · 規約 · プライバシー · 言語">
      <Card>
        <CardHeader>
          <CardTitle level={2}>認証画面の法務フッター</CardTitle>
          <CardDescription>
            localeは任意です。リンク先と遷移方法はconsumerが所有します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <AuthFooter
              product="id.godx.jp"
              terms={<a href="#terms">利用規約</a>}
              privacy={<a href="#privacy">プライバシー</a>}
              locale={<button type="button">日本語</button>}
            />
            <AuthFooter product="Godx ID" terms="Terms" privacy="Privacy" />
          </AuthStack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
