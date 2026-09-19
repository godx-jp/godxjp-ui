import { Callout } from "@godxjp/ui/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Prose,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Callout · the aside INSIDE a document body — the Alert primitive with the
 * structural axis fixed to variant="callout". It is the one variant that is NOT a
 * live region: role="note", so a page carrying three of them stays silent on load.
 * kind is the GitHub/Obsidian admonition preset (note/tip/important/warning/caution)
 * and resolves tone + glyph; tone and icon still override per instance. Geometry —
 * the leading rail, the prose insets, the block margin — is owned by the --callout-*
 * tokens, never consumer CSS.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Callout"
      subtitle="kind × tone × icon · the static aside in prose (the announcing presentations are Alert and Banner)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>The five admonitions · every kind</CardTitle>
            <CardDescription>
              GitHub&apos;s documented set, which Obsidian&apos;s lower-case spelling maps onto
              one-for-one. Each kind resolves a tone and its OWN glyph, so the five are told apart
              without colour (WCAG 1.4.1). important takes the neutral tone on purpose. This system
              has no purple role, and borrowing info would make it indistinguishable from note.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Callout kind="note">
                <Callout.Title>補足</Callout.Title>
                <Callout.Description>
                  この設定は次回のログインから有効になります。
                </Callout.Description>
              </Callout>
              <Callout kind="tip">
                <Callout.Title>ヒント</Callout.Title>
                <Callout.Description>
                  ⌘K でどの画面からでもコマンドパレットを開けます。
                </Callout.Description>
              </Callout>
              <Callout kind="important">
                <Callout.Title>重要</Callout.Title>
                <Callout.Description>
                  組織の所有者だけが請求情報を変更できます。
                </Callout.Description>
              </Callout>
              <Callout kind="warning">
                <Callout.Title>注意</Callout.Title>
                <Callout.Description>
                  APIキーを再発行すると、既存のキーは直ちに無効になります。
                </Callout.Description>
              </Callout>
              <Callout kind="caution">
                <Callout.Title>警告</Callout.Title>
                <Callout.Description>
                  リポジトリを削除すると、Issue と Pull Request
                  も一緒に削除されます。この操作は取り消せません。
                </Callout.Description>
              </Callout>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>In prose · what it is actually for</CardTitle>
            <CardDescription>
              A callout is part of the document being read, not an update to it, which is why it
              carries role=&quot;note&quot; and never announces. Read this card with a screen
              reader: the three callouts are reached in document order, and none of them interrupts.
              An Alert in the same place would announce all three the moment the page loaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Prose>
              <h3>APIキーの再発行</h3>
              <p>
                APIキーは組織ごとに発行され、すべての連携サービスで共有されます。ローテーションは四半期ごとを推奨しています。
              </p>
              <Callout kind="tip">
                <Callout.Description>
                  再発行の前に、連携中のサービス一覧を書き出しておくと復旧が早くなります。
                </Callout.Description>
              </Callout>
              <p>
                再発行すると新しいキーが即座に有効になり、古いキーは同じ瞬間に失効します。猶予期間はありません。
              </p>
              <Callout kind="warning">
                <Callout.Title>停止時間が発生します</Callout.Title>
                <Callout.Description>
                  古いキーを使っている連携は、新しいキーを設定するまで認証に失敗します。
                </Callout.Description>
              </Callout>
              <p>設定画面の「セキュリティ」タブから、いつでも再発行の履歴を確認できます。</p>
              <Callout kind="note">
                <Callout.Description>
                  履歴は90日間保持されます。それより古い記録は監査ログからのみ参照できます。
                </Callout.Description>
              </Callout>
            </Prose>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Title-less · a single paragraph</CardTitle>
            <CardDescription>
              Callout.Title is optional, exactly as on Alert. With one line of copy the glyph and
              the rail carry the kind on their own, and the aside stays the height of its text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Callout kind="note">
                <Callout.Description>
                  Rates are shown in the organization&apos;s billing currency, not the viewer&apos;s
                  locale.
                </Callout.Description>
              </Callout>
              <Callout kind="caution">
                <Callout.Description>
                  Exporting includes personal data; the download link expires after one hour.
                </Callout.Description>
              </Callout>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Overrides · tone and icon, per instance</CardTitle>
            <CardDescription>
              kind is a preset, not a second colour axis. Pass tone to recolour one aside without
              changing which admonition it is, or icon={false} to drop the glyph entirely. The tone
              vocabulary is the SAME one Alert and Banner use.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Callout kind="note" tone="muted">
                <Callout.Title>Quieter than the default note</Callout.Title>
                <Callout.Description>
                  tone=&quot;muted&quot; keeps the note glyph and drops the colour to the neutral
                  surface.
                </Callout.Description>
              </Callout>
              <Callout kind="important" icon={false}>
                <Callout.Title>Glyphless</Callout.Title>
                <Callout.Description>
                  icon={"{false}"} removes the leading glyph; the rail alone carries the tone.
                </Callout.Description>
              </Callout>
              <Callout kind="tip" tone="info">
                <Callout.Title>A tip in the note colour</Callout.Title>
                <Callout.Description>
                  The lightbulb stays, so this is still readable as a tip without relying on the
                  hue.
                </Callout.Description>
              </Callout>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Long JA / EN / VI copy · 390px wrapping</CardTitle>
            <CardDescription>
              The text column wraps inside min-width 0 and the rail stays on the START edge in both
              directions (logical properties throughout). Narrow this frame to 390px: nothing clips
              and nothing overflows horizontally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Callout kind="important">
                <Callout.Title>
                  ご契約中のプランでは、組織あたりのAPIリクエスト数に上限が設定されており、上限を超えた分は翌月の請求に自動的に加算されます
                </Callout.Title>
                <Callout.Description>
                  現在の消費量は請求ダッシュボードで確認できます。上限の引き上げをご希望の場合は、担当者にご連絡ください。
                </Callout.Description>
              </Callout>
              <Callout kind="caution">
                <Callout.Title>
                  Deleting an organization removes every project, dataset and audit record it owns,
                  and this cannot be undone by support
                </Callout.Title>
                <Callout.Description>
                  Members lose access immediately. Export anything you need to keep before you
                  confirm. The deletion runs as soon as the dialog closes.
                </Callout.Description>
              </Callout>
              <Callout kind="tip">
                <Callout.Title>
                  Bạn có thể gán vai trò cho cả một nhóm thay vì từng thành viên, và mọi thay đổi về
                  thành viên của nhóm sẽ tự động áp dụng
                </Callout.Title>
                <Callout.Description>
                  Cách này giữ cho danh sách phân quyền ngắn gọn và dễ kiểm toán hơn nhiều so với
                  việc cấp quyền riêng lẻ.
                </Callout.Description>
              </Callout>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
