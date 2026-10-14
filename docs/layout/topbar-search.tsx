import { Avatar, AvatarFallback, Descriptions } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  Topbar,
  TopbarItem,
  TopbarSearch,
} from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";
import type { SidebarSectionProp } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";
import { FileText, LogOut } from "lucide-react";
import { useState } from "react";

/**
 * TopbarSearch — the bar's search as a consumer ships it: first in `start` under the default
 * `topbarSpan="content"`, so it starts on the content keyline; an account cell that is avatar-only
 * below 40rem. Narrow the viewport under 640px to see the search fold to a named cell.
 */
export default function Demo() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const sections: SidebarSectionProp[] = [
    {
      label: t("topbarSearchDocs.pages"),
      items: [{ id: "guide", label: t("topbarSearchDocs.guide"), icon: FileText }],
    },
  ];

  return (
    <AppShell
      sidebar={<Sidebar activeId="guide" sections={sections} />}
      topbar={
        <Topbar
          start={
            <TopbarSearch
              ariaLabel={t("topbarSearchDocs.searchLabel")}
              placeholder={t("topbarSearchDocs.searchLabel")}
              onSearch={setQuery}
            />
          }
          end={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TopbarItem
                  aria-label={t("topbarSearchDocs.account")}
                  labelHideBelow="sm"
                  icon={
                    <Avatar>
                      <AvatarFallback>SD</AvatarFallback>
                    </Avatar>
                  }
                >
                  {t("topbarSearchDocs.userName")}
                </TopbarItem>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("topbarSearchDocs.userName")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut aria-hidden="true" />
                  {t("topbarSearchDocs.logOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      }
    >
      <PageContainer title={t("topbarSearchDocs.guide")}>
        <Flex direction="col" gap="md">
          <Text>{t("topbarSearchDocs.body")}</Text>
          <Descriptions>
            <Descriptions.Item label={t("topbarSearchDocs.lastQuery")}>
              {query || "—"}
            </Descriptions.Item>
          </Descriptions>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
