import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { AuthDivider, AuthStack, PageContainer } from "@godxjp/ui/layout";

/**
 * AuthDivider — localized conjunction between equal separator rules. The label remains visible and
 * centred under long Japanese, English and RTL content.
 */
export default function Demo() {
  return (
    <PageContainer title="AuthDivider" subtitle="認証手段を分けるローカライズ済み区切り">
      <Card>
        <CardHeader>
          <CardTitle level={2}>言語とcontent stress</CardTitle>
          <CardDescription>区切り線はlabelの長さに応じて同じ比率で縮みます。</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <AuthDivider label="または" />
            <AuthDivider label="or continue with your organization account" />
            <div dir="rtl">
              <AuthDivider label="أو تابع باستخدام حساب المؤسسة" />
            </div>
          </AuthStack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
