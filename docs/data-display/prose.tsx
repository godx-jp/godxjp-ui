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
 * Prose — typography for rendered content (Markdown, CMS bodies, issue descriptions). Styles the
 * semantic HTML inside it from the tokens; the HTML can come from react-markdown, a sanitised
 * string or JSX. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Prose" subtitle="レンダリングされた本文のタイポグラフィ">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Wiki page (size="md")</CardTitle>
            <CardDescription>
              見出し・段落・リスト・引用・表・コードを一つの本文として。ソフト改行の扱いは Markdown
              パイプライン側 (remark-breaks) の責務。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Prose size="md" imageSize="fit">
              <h1>請求書の発行手順</h1>
              <p>
                月次の請求書は <strong>締日の翌営業日</strong> に発行する。手順は{" "}
                <a href="#flow">承認フロー</a> に従う。
              </p>
              <h2 id="flow">承認フロー</h2>
              <ol>
                <li>担当者が下書きを作成する</li>
                <li>
                  経理が金額を確認する
                  <ul>
                    <li>消費税区分</li>
                    <li>源泉徴収の有無</li>
                  </ul>
                </li>
                <li>責任者が承認し、送付する</li>
              </ol>
              <blockquote>
                <p>締日を過ぎた修正は翌月の請求に繰り越す。</p>
              </blockquote>
              <h3>環境</h3>
              {/* Inside Prose the table is rendered content, not page chrome. */}
              {/* ui-audit-disable-next-line no-raw-table */}
              <table>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>値</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Browser</td>
                    <td>Chrome 140</td>
                  </tr>
                  <tr>
                    <td>Viewport</td>
                    <td>1440 x 900</td>
                  </tr>
                </tbody>
              </table>
              <h4>再現コード</h4>
              <p>
                <code>estimate.total</code> を <code>hydrate()</code> より前に読むと落ちる。
              </p>
              <pre>{`const total = estimate.total; // undefined before hydrate()`}</pre>
              <hr />
              <p>最終更新: 2026-09-05</p>
            </Prose>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Issue description (size="sm", imageSize="original")</CardTitle>
            <CardDescription>
              コンパクトな本文。貼り付けたスクリーンショットを原寸で見せる設定は横スクロールになる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Prose size="sm" imageSize="original">
              <h2>見積画面で合計が更新されない</h2>
              <p>明細を追加しても合計欄が 0 のまま。リロードすると正しい値になる。</p>
              <h3>手順</h3>
              <ol>
                <li>見積 EST-102 を開く</li>
                <li>明細を 1 行追加する</li>
                <li>合計欄を見る</li>
              </ol>
            </Prose>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
