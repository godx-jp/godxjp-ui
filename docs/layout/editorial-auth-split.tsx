import { KeyRound } from "lucide-react";
import { useTranslation } from "@godxjp/ui/i18n";

import { Avatar, AvatarFallback, Badge } from "@godxjp/ui/data-display";
import { Form, FormField, Input } from "@godxjp/ui/data-entry";
import { Button, Logo, Text } from "@godxjp/ui/general";
import {
  AuthDivider,
  EditorialAuth,
  EditorialAuthCard,
  EditorialTextButton,
  Flex,
  ResponsiveGrid,
} from "@godxjp/ui/layout";

/**
 * EditorialAuth layout="split" — the full-bleed sign-in page. Rendered as the page ROOT (no shell
 * gutters): the brand story fills the start side edge to edge over its grid texture, the logo at
 * the top, the title + copy + free-form app chips centred, the benefits pinned at the bottom; the
 * form is a plain centred column, not a card. Below 48rem the story is a full-bleed band over the
 * form, showing the short `bandSubtitle` instead of the long description. The app chips are glass
 * Badges with a letter tile, legible on the brand surface; the form card owns the page h1 and
 * takes the 48px sign-in controls (`controlSize="lg"`). Verify at 1280x800 and 390x844.
 */
export default function Demo() {
  const { t } = useTranslation();
  return (
    <EditorialAuth
      layout="split"
      appearance="brand"
      titleSize="md"
      level={2}
      bandSubtitle={t("editorialAuthSplit.bandSubtitle")}
      artFrame="none"
      eyebrow={<Logo mark="godx-lockup" productSuffix="ID" />}
      title={t("editorialAuthSplit.title")}
      description={t("editorialAuthSplit.lead")}
      art={
        <Flex wrap gap="sm">
          {(
            [
              ["T", "appTasks", 1],
              ["R", "appRestaurant", 2],
              ["P", "appPages", 3],
              ["K", "appAttendance", 8],
            ] as const
          ).map(([letter, key, app]) => (
            <Badge
              key={key}
              variant="glass"
              leading={
                <Avatar shape="square" size="xs" colorKey={app}>
                  <AvatarFallback>{letter}</AvatarFallback>
                </Avatar>
              }
            >
              {t(`editorialAuthSplit.${key}`)}
            </Badge>
          ))}
        </Flex>
      }
      benefits={[
        t("editorialAuthSplit.benefitPasskey"),
        t("editorialAuthSplit.benefitMfa"),
        t("editorialAuthSplit.benefitTenant"),
      ]}
    >
      <EditorialAuthCard
        title={t("editorialAuthSplit.signIn")}
        level={1}
        controlSize="lg"
        footer={
          <Flex justify="between" align="center">
            <Text>{t("editorialAuthSplit.newHere")}</Text>
            <EditorialTextButton>{t("editorialAuthSplit.createAccount")}</EditorialTextButton>
          </Flex>
        }
      >
        <Form onSubmit={(event) => event.preventDefault()}>
          <Flex direction="col" gap="md">
            <FormField id="split-email" label={t("editorialAuthSplit.email")}>
              <Input
                id="split-email"
                type="email"
                autoComplete="username webauthn"
                placeholder="you@example.co.jp"
              />
            </FormField>
            <Button type="submit">{t("editorialAuthSplit.next")}</Button>
            <AuthDivider label={t("editorialAuthSplit.or")} />
            <Button variant="outline">
              <KeyRound aria-hidden="true" />
              {t("editorialAuthSplit.passkey")}
            </Button>
            <ResponsiveGrid columns={{ base: 3 }}>
              <Button variant="outline">Google</Button>
              <Button variant="outline">LINE</Button>
              <Button variant="outline">Facebook</Button>
            </ResponsiveGrid>
          </Flex>
        </Form>
      </EditorialAuthCard>
    </EditorialAuth>
  );
}
