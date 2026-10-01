import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  TextDiff,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

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
  return (
    <PageContainer title="TextDiff" subtitle="二つの版のテキストの差分を、削除と追加で示す">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>原文の変更を見る</CardTitle>
            <CardDescription>
              翻訳を書いた時点の原文と、いまの原文の差分です。日本語は一文字ずつ比べるので、
              助詞ひとつの変更でも文全体が変わったようには見えません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TextDiff before={PREVIOUS_ORIGINAL} after={CURRENT_ORIGINAL} lang="ja" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>規程の改訂（左右に並べる）</CardTitle>
            <CardDescription>
              変更のない行は折りたたまれ、ボタンで開けます。削除は取り消し線、追加は下線で示し、
              色だけに頼りません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TextDiff
              mode="split"
              before={PREVIOUS_POLICY}
              after={CURRENT_POLICY}
              lang="ja"
              beforeLabel="改訂前"
              afterLabel="改訂後"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>英文は単語単位で</CardTitle>
            <CardDescription>
              スペースで区切られる言語は単語ごとに比べます。行単位にしたい場合は granularity="line"
              を指定します。
            </CardDescription>
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
