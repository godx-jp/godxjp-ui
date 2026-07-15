import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Pencil, Plus, Trash2 } from "lucide-react";

/**
 * Button — the core action primitive. Composed only from real @godxjp/ui
 * components. The reference design: exactly one primary (default) action per view; height
 * comes from the size preset (--control-height); never raw <button>.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Button"
      subtitle="variant × size × state · the only action control (never a raw button element)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Count</CardTitle>
            <CardDescription>
              Trailing totals, overflow cap, and explicit zero visibility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Button variant="outline" count={18}>
                保留中
              </Button>
              <Button variant="outline" count={128} overflowCount={99}>
                受信トレイ
              </Button>
              <Button variant="ghost" count={0} showZero>
                完了
              </Button>
              <Button variant="ghost" count={0} showZero={false}>
                非表示のゼロ
              </Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Variants</CardTitle>
            <CardDescription>
              One default (primary) per view. outline / secondary / ghost for supporting actions;
              link for inline navigation; destructive for irreversible actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Button>確定 Confirm</Button>
              <Button variant="secondary">下書き Draft</Button>
              <Button variant="outline">取消 Cancel</Button>
              <Button variant="dashed">追加 Add row</Button>
              <Button variant="ghost">詳細 Details</Button>
              <Button variant="link">もっと見る More</Button>
              <Button variant="destructive">削除 Delete</Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Shape</CardTitle>
            <CardDescription>
              `shape` sets corner radius from the tokens: default (control radius) / pill (fully
              rounded) / sharp (square). Works with any variant or size.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Button shape="default">Default</Button>
              <Button shape="pill">Pill</Button>
              <Button shape="sharp">Sharp</Button>
              <Button shape="pill" variant="outline">
                Pill outline
              </Button>
              <Button shape="sharp" variant="secondary">
                Sharp secondary
              </Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Sizes</CardTitle>
            <CardDescription>
              Height comes from the preset: xs 24 / sm 28 / default 32 / lg 36. Icon-only buttons
              use the square icon-* sizes. icon-xs owns a 12px glyph: an explicit size-4 class on
              its SVG is normalized so compact-density padding cannot collapse. Fine pointers use
              the active --control-height-xs visual square; coarse pointers expand the actual hit
              target to the framework's 44px --control-height-default floor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" wrap align="center" gap="md">
                <Button size="xs">XS</Button>
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </Flex>
              <Flex direction="row" wrap align="center" gap="md">
                <Button size="icon-xs" variant="ghost" aria-label="Edit">
                  <Pencil />
                </Button>
                <Button size="icon-xs" variant="ghost" aria-label="Edit with 16px icon">
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="Edit">
                  <Pencil />
                </Button>
                <Button size="icon" variant="outline" aria-label="Add">
                  <Plus />
                </Button>
                <Button size="icon-lg" aria-label="Add">
                  <Plus />
                </Button>
              </Flex>
              <div className="ui-density-compact">
                <Flex direction="row" wrap align="center" gap="md">
                  <Button size="icon-xs" variant="ghost" aria-label="Compact edit">
                    <Pencil />
                  </Button>
                  <Button size="icon-xs" variant="ghost" aria-label="Compact edit with 16px icon">
                    <Pencil className="size-4" />
                  </Button>
                </Flex>
              </div>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Icon + label, states, and links</CardTitle>
            <CardDescription>
              Leading icons auto-size to 1rem. disabled blocks pointer events (prevents
              double-submit). Use asChild to render a real link with button styling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Button>
                <Plus />
                新規作成 New
              </Button>
              <Button variant="destructive">
                <Trash2 />
                削除 Delete
              </Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>
                Disabled
              </Button>
              <Button asChild variant="link">
                <a href="#">Navigate as a link</a>
              </Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Full width</CardTitle>
            <CardDescription>
              `fullWidth` spans the container (`width:100%`) — the prop form of `className="w-full"`
              for stacked auth / dialog-footer actions. Use the prop, not a raw utility (rule #42).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm" className="max-w-xs">
              <Button fullWidth>ログイン Sign in</Button>
              <Button fullWidth variant="outline">
                アカウント作成 Create account
              </Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Loading</CardTitle>
            <CardDescription>
              `loading` shows a leading spinner, sets `aria-busy`, and blocks activation while
              keeping the label in place (no width jump). `loadingText` swaps the label for an
              i18n-friendly in-flight message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Button loading loadingText="保存中…">
                保存 Save
              </Button>
              <Button variant="outline" loading loadingText="送信中…">
                送信 Submit
              </Button>
              <Button variant="destructive" loading loadingText="削除中…">
                削除 Delete
              </Button>
              <Button loading>処理中…</Button>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
