import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  FormField,
  PasswordInput,
  PasswordStrength,
} from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * PasswordStrength — 0-4 score bar + rule checklist paired with PasswordInput.
 * Always render immediately below the PasswordInput it evaluates.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [signupPassword, setSignupPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  return (
    <PageContainer
      title="PasswordStrength"
      subtitle="パスワード強度メーター — スコアバー＋ルールチェックリスト"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>新規登録フォーム</CardTitle>
            <CardDescription>
              PasswordInput の直下に配置し、入力と同時にスコアを表示する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="signup-password" label="パスワード" required>
                <PasswordInput
                  id="signup-password"
                  name="password"
                  autoComplete="new-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="8文字以上のパスワード"
                />
              </FormField>
              <PasswordStrength value={signupPassword} showChecklist />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カスタムルール + ラベル</CardTitle>
            <CardDescription>
              rules で評価項目を絞り込み、labels でスコア表示を日本語化。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="reset-password" label="新しいパスワード" required>
                <PasswordInput
                  id="reset-password"
                  name="new_password"
                  autoComplete="new-password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="新しいパスワード"
                />
              </FormField>
              <PasswordStrength
                value={resetPassword}
                rules={["length", "upper", "lower", "number"]}
                labels={{ weak: "弱い", fair: "普通", strong: "強い" }}
                showChecklist
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>チェックリスト非表示</CardTitle>
            <CardDescription>
              showChecklist={"{false}"} でスコアバーのみ表示するコンパクト版。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <PasswordInput autoComplete="new-password" defaultValue="MyP@ss1" disabled />
              <PasswordStrength value="MyP@ss1" showChecklist={false} />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
