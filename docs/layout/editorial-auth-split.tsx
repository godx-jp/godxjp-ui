import { KeyRound } from "lucide-react";

import { Badge } from "@godxjp/ui/data-display";
import { Form, FormField, Input } from "@godxjp/ui/data-entry";
import { Button, Logo, Text } from "@godxjp/ui/general";
import {
  AuthDivider,
  EditorialAuth,
  EditorialAuthCard,
  EditorialTextButton,
  Flex,
  ResponsiveGrid,
} from "@godxjp/ui/layout";

/**
 * EditorialAuth layout="split" — the full-bleed sign-in page. Rendered as the page ROOT (no shell
 * gutters): the brand story fills the start side edge to edge over its grid texture, the logo at
 * the top, the title + copy + free-form app chips centred, the benefits pinned at the bottom; the
 * form is a plain centred column, not a card. Below 48rem the story is a full-bleed band over the
 * form (bandDescription="hidden" keeps that band to the logo and the title). Verify at 1280x800
 * and 390x844.
 */
export default function Demo() {
  return (
    <EditorialAuth
      layout="split"
      appearance="brand"
      titleSize="md"
      bandDescription="hidden"
      artFrame="none"
      eyebrow={<Logo mark="godx-lockup" productSuffix="ID" />}
      title={"ひとつの ID で、\n仕事のアプリすべてへ。"}
      description="タスク、レストラン管理、Pages…。一度ログインすれば、どのアプリにもそのまま入れます。"
      art={
        <Flex wrap gap="sm">
          <Badge variant="outline">GoDX タスク</Badge>
          <Badge variant="outline">レストラン管理</Badge>
          <Badge variant="outline">GoDX Pages</Badge>
          <Badge variant="outline">勤怠</Badge>
        </Flex>
      }
      benefits={["パスキー対応", "二要素認証", "組織ごとに分かれたデータ"]}
    >
      <EditorialAuthCard
        title="ログイン"
        level={2}
        footer={
          <Flex justify="between" align="center">
            <Text>はじめての方</Text>
            <EditorialTextButton>アカウントを作成</EditorialTextButton>
          </Flex>
        }
      >
        <Form onSubmit={(event) => event.preventDefault()}>
          <Flex direction="col" gap="md">
            <FormField id="split-email" label="メールアドレス">
              <Input
                id="split-email"
                type="email"
                autoComplete="username webauthn"
                placeholder="you@example.co.jp"
              />
            </FormField>
            <Button type="submit">次へ</Button>
            <AuthDivider label="または" />
            <Button variant="outline">
              <KeyRound aria-hidden="true" />
              パスキーでログイン
            </Button>
            <ResponsiveGrid columns={{ base: 3 }}>
              <Button variant="outline">Google</Button>
              <Button variant="outline">LINE</Button>
              <Button variant="outline">Facebook</Button>
            </ResponsiveGrid>
          </Flex>
        </Form>
      </EditorialAuthCard>
    </EditorialAuth>
  );
}
