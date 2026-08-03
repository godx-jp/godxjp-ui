import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { AuthAccountSummary, AuthIdentity, AuthStack, PageContainer } from "@godxjp/ui/layout";

/**
 * AuthIdentity — canonical identity title with optional relying-party request context. The
 * requester line is consumer data and may be omitted for first-party authentication.
 */
export default function Demo() {
  return (
    <PageContainer title="AuthIdentity" subtitle="ホストIDと依頼元サービスのコンテキスト">
      <Card>
        <CardHeader>
          <CardTitle level={2}>依頼元あり・なし</CardTitle>
          <CardDescription>
            外部サービスからの認証要求だけrequesterを表示し、通常ログインでは省略します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <AuthIdentity title="Godx IDにログイン" requester="勤怠管理が認証を要求しています" />
            <AuthIdentity title="アカウントを確認" />
            <AuthIdentity
              title="Continue to Godx ID"
              requester="Enterprise Security and Compliance Administration is requesting sign in"
            />
            <AuthAccountSummary
              email="very.long.authoritative.account@example.enterprise.invalid"
              actionLabel="アカウントを切り替える"
              onAction={() => {}}
            />
          </AuthStack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
