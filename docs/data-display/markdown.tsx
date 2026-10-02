import { Markdown, RENDERER_VERSION } from "@godxjp/markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Prose,
} from "@godxjp/ui/data-display";
import { useTranslation } from "@godxjp/ui/i18n";
import { PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

const page = `# 結合テスト計画

決済モジュールの請求書再発行シナリオを対象にする。詳細は[設計書](/wiki/設計/決済)を参照[^1]。

## 範囲

| シナリオ | 担当 | 状態 |
|:--|:--|--:|
| 再発行（通常） | 田中 | 完了 |
| 再発行（税率変更後） | 佐藤 | 進行中 |

- [x] テストデータ作成
- [ ] ステージング反映
- [ ] 受入レビュー

## 流れ

\`\`\`mermaid
graph LR
  A[申請] --> B{承認}
  B -->|承認| C[再発行]
  B -->|差戻し| A
\`\`\`

\`\`\`ts
await invoices.reissue(id, { reason: "tax-rate" });
\`\`\`

[^1]: 設計書は 2026-10 版。`;

const hostile = `<script>alert(1)</script>

[危険なリンク](javascript:alert(1)) と ![データ画像](data:image/svg+xml;base64,PHN2Zz4=)

<img src=x onerror="alert(1)">`;

/**
 * @godxjp/markdown — the one Markdown renderer (gh#1108). A wiki page body rendered as the
 * published page shows it, and a hostile body rendered by the same component.
 */
export default function Demo() {
  const { t } = useTranslation();
  return (
    <PageContainer
      title="Markdown"
      subtitle={t("markdownDocs.subtitle", { version: String(RENDERER_VERSION) })}
    >
      <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="md">
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("markdownDocs.page.title")}</CardTitle>
            <CardDescription>{t("markdownDocs.page.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Prose>
              <Markdown>{page}</Markdown>
            </Prose>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("markdownDocs.hostile.title")}</CardTitle>
            <CardDescription>{t("markdownDocs.hostile.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Prose>
              <Markdown>{hostile}</Markdown>
            </Prose>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </PageContainer>
  );
}
