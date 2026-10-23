import * as React from "react";
import {
  BranchScopePicker,
  Form,
  FormField,
  type BranchScopeValueProp,
} from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { AppShell, PageContainer, Sidebar } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";

/** Viewing scope belongs to the URL; record ownership is independent and validated on submit.
 * A router may replace this history adapter. Authorize IDs on the server too.
 * For one authorized branch, resolve the URL/default in the app before hideWhenSingle.
 */
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
  const [recordBranch, setRecordBranch] = React.useState<BranchScopeValueProp>({
    mode: "selected",
    branchIds: [],
  });
  const [submitted, setSubmitted] = React.useState(false);
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
  const valid =
    recordBranch.mode === "selected" &&
    recordBranch.branchIds?.length === 1 &&
    branches.some((branch) => branch.id === recordBranch.branchIds![0]);
  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="scope"
          brand={<Text weight="medium">{t("docs.branchNavigation.title")}</Text>}
          action={
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
          }
          sections={[]}
        />
      }
    >
      <PageContainer title={t("docs.branchNavigation.title")} measure="narrow">
        <Text>{t("docs.branchNavigation.intro")}</Text>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <FormField label={t("docs.branchNavigation.record")} required>
            <BranchScopePicker
              branches={branches}
              selectionMode="single"
              allowAll={false}
              value={recordBranch}
              onValueChange={setRecordBranch}
              error={submitted && !valid ? t("docs.branchNavigation.required") : undefined}
            />
          </FormField>
          <Button type="submit">{t("docs.branchNavigation.save")}</Button>
          {submitted && valid && <Text role="status">{t("docs.branchNavigation.saved")}</Text>}
        </Form>
      </PageContainer>
    </AppShell>
  );
}
