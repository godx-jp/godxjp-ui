import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Logo } from "@godxjp/ui/general";
import { AuthAccountSummary, AuthIdentity, AuthStack, PageContainer } from "@godxjp/ui/layout";

/**
 * AuthIdentity — canonical identity title with optional relying-party request context. The
 * requester line is consumer data and may be omitted for first-party authentication.
 *
 * `brand` is the product's own artwork, in the MARK's place: the h1 stays painted and keeps naming
 * the block, and the artwork is decorative whatever fills it — so a lockup that spells "GoDX | ID"
 * is not announced on top of the heading. When the lockup already carries the product name, make
 * `title` the SCREEN'S purpose ("サインイン") rather than repeating the brand.
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

      <Card>
        <CardHeader>
          <CardTitle level={2}>brand · 製品ロックアップ</CardTitle>
          <CardDescription>
            brandを渡すとパッケージのマークが製品のロックアップに置き換わります。h1はtitleを読み上げ名
            として保持し、ロックアップは装飾扱いになるため製品名は一度だけ読まれます。ロックアップが製品名
            を含む場合、titleには画面の目的を入れてください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <AuthIdentity
              title="サインイン"
              brand={<Logo mark="godx-lockup" productSuffix="ID" />}
            />
            <AuthIdentity
              title="サインイン"
              brand={<Logo mark="godx-lockup" productSuffix="ID" size="lg" />}
              requester="勤怠管理が認証を要求しています"
            />
            <AuthIdentity
              title="サインイン"
              brand={<Logo glyph="a" wordmark="Acme" productSuffix="ID" />}
            />
          </AuthStack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
