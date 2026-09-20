import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlock,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const responseBody = `{
  "data": {
    "id": 2,
    "key": "EXSELI-2",
    "title": "見積画面で合計が更新されない",
    "attachments": [
      { "id": 7, "name": "trace.har", "size": 65536 },
      { "id": 8, "name": "screenshot.png", "size": 240113 }
    ]
  }
}`;

const consoleLog = `[12:04:11.203] warn  Deprecated: estimate.total is read before hydrate()
[12:04:11.209] error TypeError: Cannot read properties of undefined (reading 'total')
    at EstimateSummary (estimate-summary.tsx:41:17)
[12:04:11.210] info  retry 1/3`;

const longHeader =
  'report-to: {"endpoints":[{"url":"https:\\/\\/a.nel.cloudflare.com\\/report\\/v4?s=' +
  "x".repeat(200) +
  '"}],"group":"cf-nel","max_age":604800}';

/**
 * CodeBlock — a block of preformatted text: request and response bodies, console output,
 * snippets. Wraps long lines by default and scrolls inside the block past `maxHeight`.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="CodeBlock" subtitle="整形済みテキストのブロック · 折り返しと高さ上限">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Response body (maxHeight="sm")</CardTitle>
            <CardDescription>
              64 KB のレスポンスでもページを押し下げない。上限を超えるとブロック内でスクロールする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock maxHeight="sm" language="json" aria-label="Response body">
              {responseBody}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Console (size="xs", maxHeight="md")</CardTitle>
            <CardDescription>ログは xs で密に。行の折り返しは既定で有効。</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock size="xs" maxHeight="md" aria-label="Console output">
              {consoleLog}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Long line: wrap (default) vs wrap={"{false}"}</CardTitle>
            <CardDescription>
              241 文字のヘッダー値。既定はカード内で折り返す。wrap=false は横スクロールになる
              (maxHeight="lg" / "none")。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <CodeBlock size="sm" maxHeight="none" aria-label="Wrapped header">
                {longHeader}
              </CodeBlock>
              <CodeBlock wrap={false} maxHeight="lg" aria-label="Unwrapped header">
                {longHeader}
              </CodeBlock>
            </Flex>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>Syntax colour · the package owns the palette (gh#784)</CardTitle>
            <CardDescription>
              CodeBlock bundles no highlighter. Bring your own, then tag each span with
              data-code-token and the package colours it. The twelve names are Shiki
              createCssVariablesTheme&apos;s verbatim, so mapping is a rename rather than a
              translation. Note what the consumer never writes: no style attribute, no palette
              class. Every knob is a role-mirror, so this follows the theme into dark with no second
              palette.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="ts" aria-label="Highlighted TypeScript">
              <span data-code-token="comment">{"// resolve the active tenant\n"}</span>
              <span data-code-token="keyword">export</span>{" "}
              <span data-code-token="keyword">async</span>{" "}
              <span data-code-token="keyword">function</span>{" "}
              <span data-code-token="function">loadTenant</span>
              <span data-code-token="punctuation">(</span>
              <span data-code-token="parameter">slug</span>
              <span data-code-token="punctuation">:</span>{" "}
              <span data-code-token="constant">string</span>
              <span data-code-token="punctuation">)</span>{" "}
              <span data-code-token="punctuation">{"{"}</span>
              {"\n  "}
              <span data-code-token="keyword">const</span> res{" "}
              <span data-code-token="punctuation">=</span>{" "}
              <span data-code-token="keyword">await</span>{" "}
              <span data-code-token="function">fetch</span>
              <span data-code-token="punctuation">(</span>
              <span data-code-token="string">{"`/api/tenants/"}</span>
              <span data-code-token="string-expression">{"${slug}"}</span>
              <span data-code-token="string">{"`"}</span>
              <span data-code-token="punctuation">)</span>
              <span data-code-token="punctuation">;</span>
              {"\n  "}
              <span data-code-token="keyword">return</span> res
              <span data-code-token="punctuation">.</span>
              <span data-code-token="function">json</span>
              <span data-code-token="punctuation">()</span>
              <span data-code-token="punctuation">;</span>
              {"\n"}
              <span data-code-token="punctuation">{"}"}</span>
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Diff tokens · inserted and deleted</CardTitle>
            <CardDescription>
              The same vocabulary carries a diff. inserted, deleted and changed default to the
              success, destructive and warning roles, so they agree with every other affirmative and
              destructive mark in the system rather than inventing a second green and red.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="diff" aria-label="Patch">
              <span data-code-token="comment">{"--- a/tokens.css\n+++ b/tokens.css\n"}</span>
              <span data-code-token="deleted">{"-  --code-block-foreground: #111;\n"}</span>
              <span data-code-token="inserted">{"+  --code-block-foreground: initial;\n"}</span>
              <span data-code-token="changed">
                {"!  --code-block-token-changed-color: initial;\n"}
              </span>
              <span data-code-token="punctuation">
                {"   /* role-mirror: the default moved to the call site */"}
              </span>
            </CodeBlock>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
