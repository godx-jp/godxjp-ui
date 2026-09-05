import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, PasswordInput } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * PasswordInput — password field with a built-in show/hide eye toggle.
 * Always use this instead of <Input type="password">; never add your own
 * eye button. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  return (
    <PageContainer title="PasswordInput" subtitle="パスワード入力 · 表示/非表示トグル付き">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>States</CardTitle>
            <CardDescription>Placeholder, filled, and disabled.</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <PasswordInput aria-label="プレースホルダー状態" placeholder="パスワードを入力" />
              <PasswordInput aria-label="入力済み状態" defaultValue="S3cr3t!pass" />
              <PasswordInput aria-label="無効状態" disabled defaultValue="無効 (disabled)" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Inherited Input affordances</CardTitle>
            <CardDescription>
              PasswordInput retains leading/trailing nodes and the explicit clear callback while
              preserving its visibility control.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <PasswordInput
                aria-label="クリア可能なパスワード"
                defaultValue="secret"
                allowClear
                onClear={() => {}}
                leadingIcon={<span aria-hidden="true">L</span>}
              />
              <PasswordInput
                aria-label="末尾情報付きパスワード"
                allowClear={false}
                trailingIcon={<span aria-hidden="true">T</span>}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ログインフォーム</CardTitle>
            <CardDescription>
              current-password autoComplete でパスワードマネージャーと連携。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="current-password" label="現在のパスワード" required>
              <PasswordInput
                id="current-password"
                name="current_password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="現在のパスワード"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>パスワード変更フォーム</CardTitle>
            <CardDescription>new-password autoComplete で新しいパスワードを設定。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="new-password" label="新しいパスワード" required>
              <PasswordInput
                id="new-password"
                name="new_password"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="新しいパスワード"
              />
            </FormField>
          </CardContent>
        </Card>
        <PasswordInput
          size="sm"
          placeholder="Compact tier (sm)"
          aria-label="Password (sm)"
        />
      </Flex>
    </PageContainer>
  );
}
