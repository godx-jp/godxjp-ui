import * as React from "react";
import { BranchScopePicker, FormField, type BranchScopeValueProp } from "@godxjp/ui/data-entry";
import { Button, Heading, Text } from "@godxjp/ui/general";
import { MobileShell } from "@godxjp/ui/layout";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "@godxjp/ui/feedback";
import { useTranslation } from "@godxjp/ui/i18n";

/** More is an application destination, composed in tabBar; the shell owns no router. */
export default function Demo() {
  const { t } = useTranslation();
  const branches = [
    { id: "tokyo", name: t("docs.branchNavigation.tokyo") },
    { id: "osaka", name: t("docs.branchNavigation.osaka") },
  ];
  const readScope = (): BranchScopeValueProp => {
    const id = new URL(window.location.href).searchParams.get("branch");
    return branches.some((branch) => branch.id === id)
      ? { mode: "selected", branchIds: [id!] }
      : { mode: "all" };
  };
  const [scope, setScope] = React.useState(readScope);
  React.useEffect(() => {
    const restore = () => setScope(readScope());
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  });
  const changeScope = (next: BranchScopeValueProp) => {
    const url = new URL(window.location.href);
    if (next.mode === "selected") url.searchParams.set("branch", next.branchIds![0]);
    else url.searchParams.delete("branch");
    window.history.pushState(null, "", url);
    setScope(next);
  };
  return (
    <MobileShell
      width="phone"
      header={<Heading level={1}>{t("docs.branchNavigation.title")}</Heading>}
      tabBar={
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost">{t("docs.branchNavigation.more")}</Button>
          </SheetTrigger>
          <SheetContent responsive="bottom">
            <SheetHeader title={t("docs.branchNavigation.scope")} />
            <SheetBody>
              <FormField
                label={t("docs.branchNavigation.scope")}
                helper={t("docs.branchNavigation.guidance")}
              >
                <BranchScopePicker
                  branches={branches}
                  selectionMode="single"
                  hideWhenSingle
                  value={scope}
                  onValueChange={changeScope}
                />
              </FormField>
            </SheetBody>
          </SheetContent>
        </Sheet>
      }
    >
      <Text>{t("docs.branchNavigation.intro")}</Text>
    </MobileShell>
  );
}
