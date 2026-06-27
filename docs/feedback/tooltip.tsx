import { Tooltip, TooltipContent, TooltipTrigger } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Copy, Info, Trash2 } from "lucide-react";

/**
 * Tooltip · self-providing (no app-level TooltipProvider needed). Compose
 * Tooltip > TooltipTrigger (asChild on interactive elements) > TooltipContent.
 * Read-only hints only · use Popover for interactive floating content.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Tooltip"
      subtitle="hover/focus read-only hint · icon labels, truncated values, keyboard shortcuts"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Icon-only button labels</CardTitle>
            <CardDescription>
              Use TooltipTrigger asChild to avoid nesting a button inside a button. The tooltip
              provides the accessible label for icon-only actions in DataTable rows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="sm" align="center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="請求書をコピー">
                    <Copy className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">請求書をコピー</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="削除"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">削除 (元に戻せません)</TooltipContent>
              </Tooltip>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contextual help on a form label</CardTitle>
            <CardDescription>
              Wrap a non-interactive icon in a span with tabIndex=0 so keyboard users can focus it.
              Explain accounting terms or beta features without cluttering the UI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="sm" align="center">
              <Text weight="medium">AR 残高</Text>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="text-muted-foreground cursor-help">
                    <Info className="size-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-56">
                  売掛金の未回収合計額。請求書ステータスが「未払い」のものを集計しています。
                </TooltipContent>
              </Tooltip>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disabled button reason</CardTitle>
            <CardDescription>
              Wrap a disabled Button in a Tooltip to explain why the action is unavailable.
              TooltipTrigger asChild merges onto the disabled element correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-block">
                  <Button disabled>承認申請</Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">全項目を入力してから申請できます</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keyboard shortcut hint</CardTitle>
            <CardDescription>
              Surface keyboard shortcuts on toolbar buttons without adding visible text to the UI.
              delayDuration={0} for instant display on quick hover.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  検索
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">⌘K でグローバル検索を開く</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
