import { useState } from "react";
import { Building2, Menu } from "lucide-react";
import { AppShell, Flex, PageContainer, Topbar, TopbarItem } from "@godxjp/ui/layout";
import { Avatar, AvatarFallback } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import {
  AppSettingPicker,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@godxjp/ui/navigation";

/** Shared-device identity is an explicit exception to the default avatar-only phone account. */
export default function Demo() {
  const { t } = useTranslation();
  const [longName, setLongName] = useState(false);
  const [overflow, setOverflow] = useState<"scroll" | "clip" | "menu">("scroll");
  const [organization, setOrganization] = useState(false);
  const [navigation, setNavigation] = useState(false);
  const name = t(longName ? "topbarIdentityDocs.longName" : "topbarIdentityDocs.name");
  return (
    <AppShell
      topbar={
        <Topbar
          overflow={overflow}
          start={
            <>
              <TopbarItem
                aria-label={t("topbarIdentityDocs.navigation")}
                aria-pressed={navigation}
                onClick={() => setNavigation(!navigation)}
              >
                <Menu aria-hidden="true" />
              </TopbarItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TopbarItem truncate icon={<Building2 aria-hidden="true" />}>
                    {t(organization ? "topbarIdentityDocs.otherOrg" : "topbarIdentityDocs.org")}
                  </TopbarItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setOrganization(!organization)}>
                    {t(organization ? "topbarIdentityDocs.org" : "topbarIdentityDocs.otherOrg")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
          end={<AppSettingPicker kind="locale" appearance="bar" />}
          identity={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TopbarItem
                  truncate
                  icon={
                    <Avatar aria-hidden="true">
                      <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                  }
                >
                  {name}
                </TopbarItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{name}</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setLongName(!longName)}>
                  {t("topbarIdentityDocs.switchUser")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      }
    >
      <PageContainer title={t("topbarIdentityDocs.title")}>
        <Flex direction="col" gap="lg">
          <Text>{t("topbarIdentityDocs.description")}</Text>
          <Text>{t("topbarIdentityDocs.policy")}</Text>
          <Flex gap="sm" wrap>
            <Button variant="outline" onClick={() => setLongName(!longName)}>
              {t("topbarIdentityDocs.switchUser")}
            </Button>
            {(["scroll", "clip", "menu"] as const).map((mode) => (
              <Button
                key={mode}
                variant="outline"
                aria-pressed={overflow === mode}
                onClick={() => setOverflow(mode)}
              >
                {mode}
              </Button>
            ))}
          </Flex>
          {navigation ? <Text>{t("topbarIdentityDocs.navigationOpen")}</Text> : null}
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
