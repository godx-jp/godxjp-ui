import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Field, Input } from "@godxjp/ui/data-entry";
import { Button, Logo, Reveal, Text } from "@godxjp/ui/general";
import { AuthShell, Flex } from "@godxjp/ui/layout";

/**
 * AuthShell — centred auth/login page shell (brand bar + centred card + footer) over min-h-dvh at
 * comfortable control density. Motion is delegated to <Reveal> (wrap the card) so
 * prefers-reduced-motion is honoured in one place. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <AuthShell
      brand={
        <Flex align="center" gap="sm">
          <Logo glyph="G" />
          <Text weight="medium">GodX ID</Text>
        </Flex>
      }
      footer={
        <Text size="xs" tone="muted">
          2026 GodX · プライバシー · 利用規約
        </Text>
      }
    >
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle as="h1">ログイン</CardTitle>
            <CardDescription>アカウントにサインインしてください。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field id="auth-email" label="メールアドレス">
                <Input id="auth-email" type="email" placeholder="you@example.com" />
              </Field>
              <Field id="auth-password" label="パスワード">
                <Input id="auth-password" type="password" placeholder="••••••••" />
              </Field>
              <Button fullWidth>続ける</Button>
            </Flex>
          </CardContent>
        </Card>
      </Reveal>
    </AuthShell>
  );
}
