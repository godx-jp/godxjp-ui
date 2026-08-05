import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { AuthAccountSummary, AuthStack, PageContainer } from "@godxjp/ui/layout";

/**
 * AuthAccountSummary — compact signed-in identity row for hosted auth and device authorization.
 *
 * The row owns three things: the avatar (image, caller fallback, or the default person glyph),
 * the account address, and exactly one ghost action. Everything else is consumer data.
 *
 * The address CLIPS with an ellipsis, so it declares its own line box rather than inheriting one
 * (gh#254): a tight inherited line-height makes the clip box shorter than the font's ascent plus
 * descent and shears Vietnamese tone marks and Latin descenders off, while the DOM text stays
 * correct. The Vietnamese row below is the regression case for that.
 */
export default function Demo() {
  return (
    <PageContainer
      title="AuthAccountSummary"
      subtitle="サインイン中のアカウント行（アバター・アドレス・単一アクション）"
    >
      <Card>
        <CardHeader>
          <CardTitle level={2}>アバターの3系統</CardTitle>
          <CardDescription>
            画像、呼び出し側のフォールバック文字、既定の人物グリフ。いずれも装飾扱いで、読み上げ対象は
            アドレスとアクションのみです。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <AuthAccountSummary
              email="hanako.yamada@example.co.jp"
              avatarSrc="https://i.pravatar.cc/64?img=47"
              actionLabel="アカウントを切り替える"
              onAction={() => {}}
            />
            <AuthAccountSummary
              email="taro.suzuki@example.co.jp"
              avatarFallback="鈴"
              actionLabel="アカウントを切り替える"
              onAction={() => {}}
            />
            <AuthAccountSummary
              email="operations@example.co.jp"
              actionLabel="アカウントを切り替える"
              onAction={() => {}}
            />
          </AuthStack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>無効状態</CardTitle>
          <CardDescription>
            アクションだけが無効になります。アドレスは引き続き選択・読み上げできます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <AuthAccountSummary
              email="locked.account@example.co.jp"
              actionLabel="切り替えできません"
              onAction={() => {}}
              disabled
            />
          </AuthStack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>長いアドレスと多言語</CardTitle>
          <CardDescription>
            省略記号で切り詰めても、ベトナム語の声調記号とラテン文字のディセンダーが欠けないことを
            確認します。ホバーで全文をtitle属性から参照できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthStack>
            <AuthAccountSummary
              email="very.long.authoritative.account.address@example.enterprise.invalid"
              actionLabel="アカウントを切り替える"
              onAction={() => {}}
            />
            <AuthAccountSummary
              email="phuong.nguyen.quynh@doanhnghiep.example.vn"
              avatarFallback="Ph"
              actionLabel="Chuyển đổi tài khoản"
              onAction={() => {}}
            />
            <AuthAccountSummary
              email="jennifer.pettigrew@enterprise-security.example.com"
              avatarFallback="JP"
              actionLabel="Switch account"
              onAction={() => {}}
            />
          </AuthStack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
