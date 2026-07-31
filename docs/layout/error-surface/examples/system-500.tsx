import { EmptyState } from "@godxjp/ui/data-display";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { CenteredShell, Flex } from "@godxjp/ui/layout";
import { RotateCcw, ServerCrash } from "lucide-react";

/**
 * 500 — SYSTEM mode. The app itself is the thing that failed, so there is no authenticated shell to
 * preserve (the session, the nav data and the user menu may all be unavailable). The page is a
 * viewport-centred standalone surface owned by the package:
 *
 *   <CenteredShell align="center" width="sm">
 *
 * `align="center"` flips `--centered-shell-column-offset-block` to `auto`, so the column centres in
 * the `100dvh` shell at 1440 / 1024 / 390 with NO consumer `min-h-dvh`, flex CSS or `className`.
 * Auto block offsets collapse when the content is taller than the viewport, so a long localized
 * message scrolls from the top instead of being clipped.
 *
 * `width="sm"` (~32rem) keeps the measure tight; the description's own measure is owned by
 * `--empty-state-description-max-width`. `titleLevel={1}` because a system page has no page `h1`
 * above it — the error title IS the document's heading.
 *
 * The optional brand line goes in `topbar`; drop it for a bare surface.
 */
export default function Demo() {
  return (
    <CenteredShell
      align="center"
      width="sm"
      footer={
        <Text size="xs" tone="muted">
          2026 GodX
        </Text>
      }
    >
      <Flex direction="col" align="center" gap="sm">
        <Logo glyph="G" />
        <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
          500
        </Text>
        <EmptyState
          icon={ServerCrash}
          tone="destructive"
          titleLevel={1}
          title="問題が発生しました"
          description="予期しないエラーが発生しました。担当チームに通知済みです。時間をおいて再度お試しください。"
          action={
            <Button>
              <RotateCcw />
              再読み込み
            </Button>
          }
        />
        {/* 任意のメタデータスロット：サポート照会用の相関 ID。等幅で読み上げ・書き写しを正確に。 */}
        <Text as="p" size="xs" tone="muted" mono>
          リクエスト ID: 01J9Z0M7Q2K5S7WQ3T5N8V2H4B
        </Text>
      </Flex>
    </CenteredShell>
  );
}
