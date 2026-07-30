import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Field, Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { AuthDivider, AuthStack, PageContainer } from "@godxjp/ui/layout";

/**
 * AuthStack — canonical vertical rhythm for direct auth-card sections. The stack remains a neutral
 * container, so labels, controls and actions retain their own semantic ownership.
 */
export default function Demo() {
  return (
    <PageContainer title="AuthStack" subtitle="認証カード内の12px垂直リズム">
      <Card>
        <CardHeader>
          <CardTitle level={2}>メールまたはpasskey</CardTitle>
          <CardDescription>
            各sectionはpublic componentのままstackへ直接配置します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <Button fullWidth>Passkeyで続ける</Button>
            <AuthDivider label="または" />
            <Field id="auth-stack-email" label="メールアドレス">
              <Input
                id="auth-stack-email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
              />
            </Field>
            <Button variant="outline" fullWidth>
              メールで続ける
            </Button>
          </AuthStack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
