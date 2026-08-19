import { Card, CardContent } from "@godxjp/ui/data-display";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import {
  AuthDivider,
  AuthFooter,
  AuthIdentity,
  AuthShell,
  AuthStack,
  Flex,
} from "@godxjp/ui/layout";

/**
 * SCR-001 Login visual contract. `?state=standalone|one-line|wrapped` drives the package visual
 * test; all three keep the same card anchor without consumer CSS or fake requester data.
 *
 * The composition mirrors the documented consumer page exactly (gh#263): NO top brand bar (the
 * canonical SCR-001 artboard has none — the in-flow AuthIdentity mark IS the brand), a header-less
 * `<CardContent solo>` body, `AuthFooter` as the third direct child (the login preset's third grid
 * row), and a plain 12px text-link row like the artboard's.
 */
export default function Demo() {
  const state = new URLSearchParams(window.location.search).get("state") ?? "one-line";
  const requester =
    state === "standalone"
      ? undefined
      : state === "wrapped"
        ? "Platform console browser BFF is requesting sign in to this organization"
        : "Attendance is requesting sign in";

  return (
    <AuthShell variant="canonical" preset="login">
      <AuthIdentity title="GoDX ID" requester={requester} />
      <Card>
        <CardContent solo>
          <AuthStack>
            <Button fullWidth>パスキーでサインイン</Button>
            <AuthDivider label="または" />
            <FormField id="auth-email" label="メールアドレス" layout="vertical">
              <Input id="auth-email" type="email" placeholder="you@example.co.jp" />
            </FormField>
            <Button variant="outline" fullWidth>
              次へ
            </Button>
            <Flex justify="between" wrap>
              <Text size="xs">
                <a href="#register">アカウント登録</a>
              </Text>
              <Text size="xs">
                <a href="#forgot">パスワードを忘れた</a>
              </Text>
            </Flex>
          </AuthStack>
        </CardContent>
      </Card>
      <AuthFooter product="GoDX ID" terms="利用規約" privacy="プライバシー" />
    </AuthShell>
  );
}
