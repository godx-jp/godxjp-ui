import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, TagInput } from "@godxjp/ui/data-entry";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TagInput — free-form multi-value chips input. value is string[] (NOT string).
 * Enter or comma commits a tag; Backspace on empty removes the last chip.
 * Use Select (multiple, with showSearch) instead when the set of values is fixed.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const { t } = useTranslation();
  const [invoiceTags, setInvoiceTags] = useState<string[]>(["営業部", "Q1"]);
  const [skillTags, setSkillTags] = useState<string[]>(["経理", "仕訳入力"]);
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  /* The reporter's exact 71-character string, held FIRST so the truncated chip is one of the two
     that render rather than one of the ones `+N` hides (gh#840). */
  const [ledgerTags, setLedgerTags] = useState<string[]>([
    "THEME_SEED_LEDGER_0007_CONTRAST_VERIFIED_AGAINST_CANVAS_AND_LABEL_00042",
    "本番",
    "ổn định",
  ]);

  return (
    <PageContainer
      title="TagInput"
      subtitle="Free-form chips input · value is string[]; Enter/comma to add, Backspace to remove"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>請求書ラベル</CardTitle>
            <CardDescription>
              Controlled via value/onValueChange (string[]). Deduplicate is built in. Use for ad-hoc
              record labels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="invoice-tags" label="ラベル" helper="Enterまたはカンマで追加">
              <TagInput
                value={invoiceTags}
                onValueChange={setInvoiceTags}
                placeholder="ラベルを追加..."
                name="labels"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>担当者スキルタグ</CardTitle>
            <CardDescription>
              name= emits a hidden comma-joined input for native form submission without JS wiring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="skill-tags" label="スキル・資格">
              <TagInput
                value={skillTags}
                onValueChange={setSkillTags}
                placeholder="スキルを入力..."
                name="skills"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>承認通知メール送信先</CardTitle>
            <CardDescription>
              Uncontrolled start (empty defaultValue); caller receives full updated array on each
              change.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="recipient-emails"
              label="CC送信先"
              helper="複数のメールアドレスをEnterで追加できます"
            >
              <TagInput
                id="recipient-emails"
                aria-label="CC送信先メール"
                className="contract-tag-input"
                value={recipientEmails}
                onValueChange={setRecipientEmails}
                placeholder="メールアドレスを追加..."
                name="cc_emails"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("showcase.tagInput.longIdTitle")}</CardTitle>
            <CardDescription>
              maxTagTextLength cuts the chip TEXT only — the whole value stays in the chip&apos;s
              title and in the remove button&apos;s accessible name. maxTagCount collapses the rest
              into a +N that names, in its own title and aria-label, exactly which tags it hides.
              Neither may swallow a value silently (gh#840).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="ledger-tags"
              label={t("showcase.tagInput.ledgerLabel")}
              helper={t("showcase.tagInput.ledgerHelper")}
            >
              <TagInput
                id="ledger-tags"
                value={ledgerTags}
                onValueChange={setLedgerTags}
                maxTagCount={2}
                maxTagTextLength={16}
                aria-label={t("showcase.tagInput.ledgerLabel")}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>無効状態</CardTitle>
            <CardDescription>
              disabled dims the whole control and drops the remove buttons; the container is marked
              aria-disabled so the dimmed chips are treated as an inactive control (no contrast
              failure).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="disabled-tags" label="ラベル">
              <TagInput value={["確定済み", "ロック"]} disabled />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
