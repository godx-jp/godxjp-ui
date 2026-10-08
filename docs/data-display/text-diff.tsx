import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { TextDiff } from "@godxjp/ui/lab";

const PREVIOUS_ORIGINAL = "来週の定例会議までに、見積書を承認してください。";
const CURRENT_ORIGINAL = "今週金曜までに、見積書と請求書を却下してください。";

const PREVIOUS_POLICY = [
  "1. 申請は月末までに提出する。",
  "2. 領収書の原本を添付する。",
  "3. 上長の承認を得る。",
  "4. 経理部が内容を確認する。",
  "5. 承認後、翌月の給与と合わせて支払う。",
  "6. 不備がある場合は差し戻す。",
  "7. 差し戻しから五営業日以内に再提出する。",
  "8. 期限を過ぎた申請は受け付けない。",
].join("\n");

const CURRENT_POLICY = [
  "1. 申請は毎月二十日までに提出する。",
  "2. 領収書の原本を添付する。",
  "3. 上長の承認を得る。",
  "4. 経理部が内容を確認する。",
  "5. 承認後、翌月の給与と合わせて支払う。",
  "6. 不備がある場合は差し戻す。",
  "7. 差し戻しから五営業日以内に再提出する。",
  "8. 期限を過ぎた申請は、部長の承認があれば受け付ける。",
].join("\n");

/**
 * TextDiff — what changed between two versions of a text (gh#1096).
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const { t } = useTranslation();
  return (
    <PageContainer title="TextDiff" subtitle={t("textDiffDocs.subtitle")}>
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("textDiffDocs.source.title")}</CardTitle>
            <CardDescription>{t("textDiffDocs.source.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <TextDiff before={PREVIOUS_ORIGINAL} after={CURRENT_ORIGINAL} lang="ja" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("textDiffDocs.policy.title")}</CardTitle>
            <CardDescription>{t("textDiffDocs.policy.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <TextDiff
              mode="split"
              before={PREVIOUS_POLICY}
              after={CURRENT_POLICY}
              lang="ja"
              beforeLabel={t("textDiffDocs.policy.before")}
              afterLabel={t("textDiffDocs.policy.after")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("textDiffDocs.words.title")}</CardTitle>
            <CardDescription>{t("textDiffDocs.words.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <TextDiff
              before="Please approve the quotation before next week's meeting."
              after="Please reject the quotation and the invoice by Friday."
              lang="en"
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
