import { Button, Logo, Text } from "@godxjp/ui/general";
import { ErrorSurface } from "@godxjp/ui/layout";
import { RotateCcw } from "lucide-react";

/**
 * 500 — `mode="system"`. The app itself is the thing that failed, so there is no authenticated shell
 * to preserve (the session, the nav data and the user menu may all be unavailable). Here the surface
 * DOES own the whole page: it renders `CenteredShell align="center"` itself, which flips
 * `--centered-shell-column-offset-block` to `auto` so the column centres in the `100dvh` shell at
 * 1440 / 1024 / 390 with NO consumer `min-h-dvh`, flex CSS, media query or `className`. Auto block
 * offsets collapse when the content is taller than the viewport, so a long localized message
 * scrolls from the top instead of being clipped.
 *
 * That is the whole difference between the two modes, and it is why `mode` is not cosmetic: in
 * `application` mode the surface returns a body and inherits geometry, in `system` mode it IS the
 * page and owns geometry.
 *
 * `width` defaults to the `sm` (~32rem) system-surface tier; the description's own measure is owned
 * by `--empty-state-description-max-width`. `titleLevel` defaults to `1` in system mode, because a
 * system page has no page `h1` above it — the error title IS the document's heading.
 *
 * `brand` and `footer` are system-mode-only slots (a `Logo` above the status code, the page
 * contentinfo below). Drop both for a bare surface.
 */
export default function Demo() {
  return (
    <ErrorSurface
      mode="system"
      status={500}
      brand={<Logo glyph="G" />}
      title="問題が発生しました"
      description="予期しないエラーが発生しました。担当チームに通知済みです。時間をおいて再度お試しください。"
      requestId="01J9Z0M7Q2K5S7WQ3T5N8V2H4B"
      footer={
        <Text size="xs" tone="muted">
          2026 GodX
        </Text>
      }
      action={
        <Button>
          <RotateCcw />
          再読み込み
        </Button>
      }
    />
  );
}
