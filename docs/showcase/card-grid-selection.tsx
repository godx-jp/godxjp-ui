/**
 * Showcase · card-grid-selection — select cards, act on them in bulk, undo (gh#1252)
 *
 * A COMPOSITION PATTERN, not a component (docs/COMPOSITION-VS-COMPONENT.md, C3). Every part is a
 * shipped primitive:
 *   - `Card` + `Checkbox` per item. The checkbox's inline label is the item name, so the name is
 *     the click target and the accessible name at once — no clickable-div card.
 *   - The REAL `DataTable.BulkActions` with an explicit `count`. It reads the DataTable context
 *     only when one exists, so outside a table `count` drives it: it renders nothing at 0 and the
 *     localised "N selected" status + a labelled region above 0.
 *   - A select-all `Checkbox` that goes `"indeterminate"` on a partial selection.
 *   - `AlertDialog` (variant destructive) before the delete; `toast` with an Undo action after it,
 *     because a confirmed delete is still a mistake sometimes.
 *   - `EmptyState` once nothing is left, with the way back as its action.
 *
 * Sizes and dates go through Intl (unit + date formatting in the reader's locale). File names are
 * DATA, not chrome.
 */
import * as React from "react";
import { FolderOpen, Trash2, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  EmptyState,
} from "@godxjp/ui/data-display";
import { Checkbox } from "@godxjp/ui/data-entry";
import { AlertDialog, Toaster, toast } from "@godxjp/ui/feedback";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

type FileItem = { id: string; name: string; kilobytes: number; updated: string };

/** The folder as the server returned it. Restores keep THIS order. */
const FILES: FileItem[] = [
  { id: "f1", name: "Quarterly budget.xlsx", kilobytes: 248, updated: "2026-09-30" },
  { id: "f2", name: "Onboarding checklist.pdf", kilobytes: 1840, updated: "2026-09-21" },
  { id: "f3", name: "Brand guidelines.pdf", kilobytes: 9216, updated: "2026-08-14" },
  { id: "f4", name: "Customer interviews.docx", kilobytes: 96, updated: "2026-10-02" },
  { id: "f5", name: "Release notes 32.0.md", kilobytes: 12, updated: "2026-10-08" },
  { id: "f6", name: "Office floor plan.png", kilobytes: 3420, updated: "2026-07-03" },
];

function useFileFormat() {
  const { locale } = useTranslation();
  return React.useMemo(() => {
    const kb = new Intl.NumberFormat(locale, { style: "unit", unit: "kilobyte" });
    const mb = new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "megabyte",
      maximumFractionDigits: 1,
    });
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
    return {
      size: (kilobytes: number) =>
        kilobytes >= 1024 ? mb.format(kilobytes / 1024) : kb.format(kilobytes),
      date: (iso: string) => date.format(new Date(`${iso}T00:00:00Z`)),
    };
  }, [locale]);
}

function FileGrid({
  initialFiles = FILES,
  initialSelected = [],
}: {
  initialFiles?: FileItem[];
  initialSelected?: string[];
}) {
  const { t } = useTranslation();
  const fmt = useFileFormat();
  const [files, setFiles] = React.useState<FileItem[]>(initialFiles);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(initialSelected));
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  // Frozen when the dialog opens: the selection clears on confirm, and the title must not read
  // "Delete 0 files?" while the dialog animates out.
  const [confirmCount, setConfirmCount] = React.useState(0);

  const allSelected = files.length > 0 && files.every((f) => selected.has(f.id));
  const selectAllState: boolean | "indeterminate" = allSelected
    ? true
    : selected.size > 0
      ? "indeterminate"
      : false;

  const toggle = (id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const restore = (ids: Set<string>) => {
    // Back in the server's order, not appended at the end.
    setFiles((current) => {
      const keep = new Set(current.map((f) => f.id));
      return FILES.filter((f) => keep.has(f.id) || ids.has(f.id));
    });
    toast.success(t("showcase.cardGridSelection.restored", { count: ids.size }));
  };

  const deleteSelected = () => {
    const removed = new Set(selected);
    setFiles((current) => current.filter((f) => !removed.has(f.id)));
    setSelected(new Set());
    toast(t("showcase.cardGridSelection.deleted", { count: removed.size }), {
      action: {
        label: t("showcase.cardGridSelection.undo"),
        onClick: () => {
          restore(removed);
        },
      },
    });
  };

  if (files.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        variant="section"
        title={t("showcase.cardGridSelection.emptyTitle")}
        description={t("showcase.cardGridSelection.emptyDescription")}
        action={
          <Button
            variant="outline"
            onClick={() => {
              setFiles(FILES);
            }}
          >
            {t("showcase.cardGridSelection.reset")}
          </Button>
        }
      />
    );
  }

  return (
    <Flex direction="col" gap="md">
      <Flex direction="row" align="center" gap="md" wrap>
        <Checkbox
          checked={selectAllState}
          onCheckedChange={(next) => {
            setSelected(next === true ? new Set(files.map((f) => f.id)) : new Set());
          }}
        >
          {t("showcase.cardGridSelection.selectAll")}
        </Checkbox>
        <DataTable.BulkActions count={selected.size}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelected(new Set());
            }}
          >
            <X aria-hidden="true" />
            {t("showcase.cardGridSelection.clearSelection")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setConfirmCount(selected.size);
              setConfirmOpen(true);
            }}
          >
            <Trash2 aria-hidden="true" />
            {t("showcase.cardGridSelection.delete")}
          </Button>
        </DataTable.BulkActions>
      </Flex>

      <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 3 }}>
        {files.map((file) => {
          const isSelected = selected.has(file.id);
          return (
            <Card
              key={file.id}
              data-state={isSelected ? "selected" : undefined}
              className={isSelected ? "border-primary" : undefined}
            >
              <CardContent>
                <Flex direction="col" gap="xs">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(next) => {
                      toggle(file.id, next === true);
                    }}
                  >
                    {file.name}
                  </Checkbox>
                  <Text size="xs" tone="muted" tabular>
                    {t("showcase.cardGridSelection.meta", {
                      size: fmt.size(file.kilobytes),
                      date: fmt.date(file.updated),
                    })}
                  </Text>
                </Flex>
              </CardContent>
            </Card>
          );
        })}
      </ResponsiveGrid>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="destructive"
        title={t("showcase.cardGridSelection.confirmTitle", { count: confirmCount })}
        description={t("showcase.cardGridSelection.confirmDescription")}
        confirmLabel={t("showcase.cardGridSelection.confirm")}
        cancelLabel={t("showcase.cardGridSelection.cancel")}
        onConfirm={deleteSelected}
      />
    </Flex>
  );
}

export default function Demo() {
  const { t } = useTranslation();
  return (
    <PageContainer
      title={t("showcase.cardGridSelection.title")}
      subtitle={t("showcase.cardGridSelection.subtitle")}
    >
      <Flex direction="col" gap="lg">
        {/* At rest: two cards already selected, so the bulk bar and the indeterminate
            select-all are visible without a click. */}
        <Card>
          <CardHeader>
            <CardTitle>{t("showcase.cardGridSelection.gridTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileGrid initialSelected={["f2", "f4"]} />
          </CardContent>
        </Card>
        {/* At rest: the terminal state — everything deleted. */}
        <Card>
          <CardHeader>
            <CardTitle>{t("showcase.cardGridSelection.emptyStateTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileGrid initialFiles={[]} />
          </CardContent>
        </Card>
      </Flex>
      <Toaster />
    </PageContainer>
  );
}
