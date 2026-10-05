import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { EmojiPicker, FormField } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * EmojiPicker (gh#1164) — a page icon chosen from the active language's emoji keywords, with
 * recents and "remove icon".
 */
export default function Demo() {
  const { t } = useTranslation();
  const [icon, setIcon] = React.useState<string | null>(null);
  return (
    <PageContainer title="EmojiPicker" subtitle={t("emojiPickerDocs.subtitle")}>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("emojiPickerDocs.title")}</CardTitle>
          <CardDescription>{t("emojiPickerDocs.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction="col" gap="sm">
            <FormField id="page-icon" label={t("emojiPickerDocs.label")}>
              <EmojiPicker value={icon} onValueChange={setIcon} />
            </FormField>
            <Text size="sm" tone="muted">
              {icon ? t("emojiPickerDocs.chosen", { icon }) : t("emojiPickerDocs.none")}
            </Text>
          </Flex>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
