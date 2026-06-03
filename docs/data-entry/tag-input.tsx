import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, TagInput } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TagInput — free-form multi-value chips input. value is string[] (NOT string).
 * Enter or comma commits a tag; Backspace on empty removes the last chip.
 * Use Select (multiple, with showSearch) instead when the set of values is fixed.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [invoiceTags, setInvoiceTags] = useState<string[]>(["営業部", "Q1"]);
  const [skillTags, setSkillTags] = useState<string[]>(["経理", "仕訳入力"]);
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);

  return (
    <PageContainer
      title="TagInput"
      subtitle="Free-form chips input — value is string[]; Enter/comma to add, Backspace to remove"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>請求書ラベル</CardTitle>
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
            <CardTitle>担当者スキルタグ</CardTitle>
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
            <CardTitle>承認通知メール送信先</CardTitle>
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
                value={recipientEmails}
                onValueChange={setRecipientEmails}
                placeholder="メールアドレスを追加..."
                name="cc_emails"
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
