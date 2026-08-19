import * as React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { mergeAriaIds, pickFieldA11y } from "../../lib/field-a11y";
import { cn } from "../../lib/utils";
import { Badge } from "../data-display/badge";
import { EmptyState } from "../data-display/empty-state";
import { SkeletonRows } from "../feedback/skeleton";
import { Text } from "../general/typography";
import { CheckboxGroup } from "./checkbox-group";
import { RadioGroup } from "./radio";
import { SearchInput } from "./search-input";
import type {
  BranchScopeValueProp,
  BranchScopePickerProp,
} from "../../props/components/data-entry.prop";

export type {
  BranchScopeModeProp,
  BranchScopeOptionProp,
  BranchScopePickerProp,
  BranchScopePickerProp as BranchScopePickerProps,
  BranchScopeValueProp,
} from "../../props/components/data-entry.prop";

const DEFAULT_VALUE: BranchScopeValueProp = { mode: "all" };

/**
 * BranchScopePicker — the canonical "all branches vs an explicit subset" scope control
 * (gh#257 / DXS platform#311).
 *
 * A THIN formalized composition (the gh#251 lesson: a consumer cannot import a docs page): the
 * mode switch is the real `RadioGroup`, the subset is the real `CheckboxGroup`, search is the real
 * `SearchInput` — so keyboard behaviour (roving radios, Space on checkboxes) and the field-a11y
 * contract (`aria-labelledby`/`aria-errormessage` via `FormField`) come from the primitives, not
 * from new machinery. Domain data (the branches) is 100% consumer-supplied.
 *
 * - **Value** is a single controlled/uncontrolled object `{ mode, branchIds }`, so a form treats
 *   scope as ONE field. Switching back to `all` PRESERVES `branchIds` — an accidental mode flip
 *   must not destroy a curated subset.
 * - **Validation** (`error`) renders the message and wires `aria-invalid`/`aria-errormessage` onto
 *   the radiogroup widget; collection READ failures are `listError`/`denied`, mirroring the
 *   DataTable #216 vocabulary (precedence `loading` → `denied` → `listError` → `empty`).
 * - **`readOnly`** renders the current scope as a static summary (mode + branch badges) with no
 *   editable affordance; `disabled` keeps the controls visible but inert.
 * - **Responsive**: a single-column stack; the branch list scrolls inside its own bounded box, so
 *   the control keeps one measure at 1440/1024/390.
 */
export const BranchScopePicker = React.forwardRef<HTMLDivElement, BranchScopePickerProp>(
  function BranchScopePicker(
    {
      branches,
      value: controlledValue,
      defaultValue = DEFAULT_VALUE,
      onValueChange,
      disabled = false,
      readOnly = false,
      searchable = true,
      error,
      loading = false,
      empty,
      listError,
      denied,
      allLabel,
      selectedLabel,
      name,
      id,
      className,
      ...ariaProps
    },
    ref,
  ) {
    const { t } = useTranslation();
    const reactId = React.useId();
    const rootId = id ?? `branch-scope-${reactId}`;
    const errorId = `${rootId}-error`;

    const [uncontrolled, setUncontrolled] = React.useState<BranchScopeValueProp>(defaultValue);
    const value = controlledValue ?? uncontrolled;
    const branchIds = React.useMemo(() => value.branchIds ?? [], [value.branchIds]);

    const commit = (next: BranchScopeValueProp) => {
      if (controlledValue === undefined) setUncontrolled(next);
      onValueChange?.(next);
    };

    const [search, setSearch] = React.useState("");
    const filtered = React.useMemo(() => {
      const term = search.trim().toLocaleLowerCase();
      if (term === "") return branches;
      return branches.filter((branch) =>
        `${branch.name} ${branch.description ?? ""}`.toLocaleLowerCase().includes(term),
      );
    }, [branches, search]);

    const fieldA11y = pickFieldA11y(ariaProps);
    const invalid = error !== undefined && error !== null && error !== false;
    const isDenied = denied !== undefined && denied !== null && denied !== false;
    const isListError = listError !== undefined && listError !== null && listError !== false;

    const resolvedAllLabel = allLabel ?? t("dataEntry.branchScope.all");
    const resolvedSelectedLabel = selectedLabel ?? t("dataEntry.branchScope.selected");

    const surface = (children: React.ReactNode) => (
      <div
        ref={ref}
        id={rootId}
        data-slot="branch-scope-picker"
        data-readonly={readOnly || undefined}
        className={cn("ui-branch-scope-picker flex flex-col gap-3", className)}
      >
        {children}
      </div>
    );

    // Collection lifecycle, DataTable #216 precedence: loading → denied → listError → empty.
    if (loading) {
      return surface(
        <div aria-busy="true" aria-label={t("dataEntry.branchScope.loading")} role="status">
          <SkeletonRows rows={4} columns={2} />
        </div>,
      );
    }
    if (isDenied) {
      return surface(
        <div aria-live="polite">
          {denied === true ? (
            <EmptyState
              icon={ShieldAlert}
              tone="warning"
              variant="compact"
              title={t("dataEntry.branchScope.denied")}
              titleAs="p"
            />
          ) : (
            denied
          )}
        </div>,
      );
    }
    if (isListError) {
      return surface(
        <div role="alert">
          {listError === true ? (
            <EmptyState
              icon={AlertCircle}
              tone="destructive"
              variant="compact"
              title={t("dataEntry.branchScope.error")}
              titleAs="p"
            />
          ) : (
            listError
          )}
        </div>,
      );
    }
    if (branches.length === 0) {
      return surface(
        <div aria-live="polite">
          {empty ?? (
            <EmptyState variant="compact" title={t("dataEntry.branchScope.empty")} titleAs="p" />
          )}
        </div>,
      );
    }

    // Locked view: the current scope as a static, non-interactive summary.
    if (readOnly) {
      const selectedBranches = branches.filter((branch) => branchIds.includes(branch.id));
      return surface(
        <>
          <Text size="sm" weight="medium">
            {value.mode === "all" ? resolvedAllLabel : resolvedSelectedLabel}
          </Text>
          {value.mode === "selected" && (
            <div className="flex flex-wrap gap-1.5">
              {selectedBranches.map((branch) => (
                <Badge key={branch.id} variant="outline">
                  {branch.name}
                </Badge>
              ))}
            </div>
          )}
        </>,
      );
    }

    return surface(
      <>
        <RadioGroup
          value={value.mode}
          onValueChange={(mode) => {
            // Mode flips preserve branchIds: switching back to `all` must not destroy the subset.
            commit({ ...value, mode: mode as BranchScopeValueProp["mode"] });
          }}
          options={[
            {
              value: "all",
              label: resolvedAllLabel,
              description:
                allLabel === undefined ? t("dataEntry.branchScope.allDescription") : undefined,
            },
            {
              value: "selected",
              label: resolvedSelectedLabel,
              description:
                selectedLabel === undefined
                  ? t("dataEntry.branchScope.selectedDescription")
                  : undefined,
            },
          ]}
          disabled={disabled}
          name={name}
          {...fieldA11y}
          aria-invalid={invalid ? true : fieldA11y["aria-invalid"]}
          aria-errormessage={
            invalid ? mergeAriaIds(errorId, fieldA11y["aria-errormessage"]) : undefined
          }
        />

        {value.mode === "selected" && (
          <div className="border-border flex flex-col gap-2 border-s-2 ps-4">
            {searchable && branches.length > 0 && (
              <SearchInput
                value={search}
                onValueChange={setSearch}
                debounce={0}
                placeholder={t("dataEntry.branchScope.searchPlaceholder")}
                ariaLabel={t("dataEntry.branchScope.searchPlaceholder")}
              />
            )}
            {filtered.length === 0 ? (
              <Text size="xs" tone="muted" aria-live="polite">
                {t("dataEntry.branchScope.noMatches")}
              </Text>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <CheckboxGroup
                  value={[...branchIds]}
                  onValueChange={(next) => commit({ mode: "selected", branchIds: next })}
                  options={filtered.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                    description: branch.description,
                    disabled: branch.disabled,
                  }))}
                  disabled={disabled}
                  aria-label={t("dataEntry.branchScope.listLabel")}
                />
              </div>
            )}
            <Text size="xs" tone="muted" aria-live="polite">
              {t("dataEntry.branchScope.selectedCount", { count: branchIds.length })}
            </Text>
          </div>
        )}

        {invalid && (
          <p id={errorId} role="alert" className="text-destructive text-xs">
            {error}
          </p>
        )}
      </>,
    );
  },
);
BranchScopePicker.displayName = "BranchScopePicker";
