import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input, PasswordInput, RadioGroup } from "@godxjp/ui/data-entry";
import { Button, Logo, Text } from "@godxjp/ui/general";
import {
  AuthDivider,
  AuthFooter,
  AuthIdentity,
  AuthShell,
  AuthStack,
  Flex,
} from "@godxjp/ui/layout";
import type { AuthShellProps } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

type AuthShellVariant = NonNullable<AuthShellProps["variant"]>;
type AuthShellDensity = NonNullable<AuthShellProps["density"]>;

/**
 * AuthShell の 2 つの直交軸: `variant`（シェルの寸法）と `density`（操作要素の段）。
 *
 * `variant="default"` は素の中央寄せシェル、`variant="canonical"` は GoDX ID の正準寸法。
 * `density` は独立した別軸で、既定は variant から導出されます（canonical なら compact、
 * default なら comfortable = 44px の WCAG タッチ下限）。明示的に渡せばその導出を上書きでき、
 * 4 通りの組み合わせがすべて成立します。
 *
 * このページは AuthShell を 1 つだけ描画します。AuthShell は banner / main / contentinfo の
 * ランドマークをページ全体に張るため、比較のために 2 つ並べるとランドマークが重複し、
 * それ自体がアクセシビリティ違反になります。そこで軸はページ内のラジオで切り替えます。
 * 初期表示は `variant="default"` × `density="comfortable"`（=素の AuthShell そのもの）。
 *
 * SCR-001 の正準ログイン（preset="login"）は Auth Shell ページ、preset の各フローは
 * Auth Shell Device / Auth Shell Context / Auth Recovery ページが受け持ちます。
 * ここに幅・余白・色の指定は 1 つもありません。すべてトークンが所有しています。
 */
export default function Demo() {
  const [variant, setVariant] = useState<AuthShellVariant>("default");
  const [density, setDensity] = useState<AuthShellDensity>("comfortable");

  return (
    <AuthShell
      variant={variant}
      density={density}
      brand={
        <Flex align="center" gap="sm">
          <Logo mark="godx" tone="success" />
          <Text weight="medium">GoDX ID</Text>
        </Flex>
      }
      footer={
        <AuthFooter
          product="GoDX ID"
          terms="利用規約"
          privacy="プライバシー"
          locale={<AppSettingPicker kind="locale" appearance="labeled" compact />}
        />
      }
    >
      <AuthIdentity title="GoDX ID" requester="経費精算がサインインを要求しています" />

      {/* preset を持たないシェルの列は子要素の間隔を持たないため、2 枚のカードの間隔は
          ページ側の Flex gap が所有します。幅は依然としてシェルのトークンが所有します。 */}
      <Flex direction="col" gap="md">
        <Card>
          <CardHeader>
            <CardTitle level={1}>サインイン</CardTitle>
            <CardDescription>組織アカウントの資格情報を入力してください。</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthStack>
              <FormField id="auth-axis-email" label="メールアドレス" layout="vertical" required>
                <Input id="auth-axis-email" type="email" placeholder="you@example.co.jp" />
              </FormField>
              <FormField id="auth-axis-password" label="パスワード" layout="vertical" required>
                <PasswordInput id="auth-axis-password" />
              </FormField>
              <Button fullWidth>サインイン</Button>
              <AuthDivider label="または" />
              <Button variant="outline" fullWidth>
                パスキーでサインイン
              </Button>
            </AuthStack>
          </CardContent>
        </Card>

        {/* 軸の切り替え。上のカードの操作要素の高さとカード内の余白がその場で変わるので、
            density がシェル全体に閉じた段であることが読み取れます。 */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>このページの表示軸</CardTitle>
            <CardDescription>
              2 つの prop は独立しています。片方を変えてももう片方は変わりません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                id="auth-axis-variant"
                label="variant · シェルの寸法"
                layout="vertical"
                helper="canonical は GoDX ID の正準寸法、default は素の中央寄せシェル。"
              >
                <RadioGroup
                  orientation="horizontal"
                  value={variant}
                  onValueChange={(next) => setVariant(next as AuthShellVariant)}
                  options={[
                    { value: "default", label: "default（既定）" },
                    { value: "canonical", label: "canonical（正準）" },
                  ]}
                />
              </FormField>
              <FormField
                id="auth-axis-density"
                label="density · 操作要素の段"
                layout="vertical"
                helper="comfortable は 44px のタッチ下限、compact は情報密度を優先した段。"
              >
                <RadioGroup
                  orientation="horizontal"
                  value={density}
                  onValueChange={(next) => setDensity(next as AuthShellDensity)}
                  options={[
                    { value: "comfortable", label: "comfortable（44px）" },
                    { value: "compact", label: "compact" },
                  ]}
                />
              </FormField>
              <Text size="sm" tone="muted">
                現在の組み合わせ: variant=&quot;{variant}&quot; · density=&quot;{density}&quot;
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </AuthShell>
  );
}
