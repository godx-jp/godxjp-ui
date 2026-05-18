import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  TableExportDialog,
  TableImportFlow,
  type TableExportFormat,
  type TableExportRange,
} from "../../components/composites/table-import-export";
import { Button } from "../../components/general/Button";

const meta: Meta<typeof TableImportFlow> = {
  title: "Data Display/Table Import & Export",
  component: TableImportFlow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**TableImportFlow** + **TableExportDialog** — A11 (canon ⑪).

These are a separate composite from the \`<Table>\` primitive
(cardinal rule 32 — not a redundant prop on Table). Consumers
import them from \`@godxjp/ui/components/composites\` and pair
them with any table screen.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TableImportFlow>;

export const ImportFlow_Validate: Story = {
  name: "Import flow · step 3 (validate + errors)",
  parameters: {
    docs: {
      description: {
        story:
          "Step 3 — the file has been parsed, encoding detected, and 798 of 1,284 rows validated. The error table previews the first 3 violations; the actions row offers the canon's two recovery paths.",
      },
    },
  },
  render: function ImportFlowValidate() {
    return (
      <TableImportFlow
        title="勤怠データ取り込み"
        currentStep="validate"
        file={{
          name: "kintai_2026_05.csv",
          rowSummary: "1,284 行",
          sizeSummary: "132 KB",
          encodingLabel: "SHIFT-JIS 検出",
          progress: 798 / 1284,
          progressLeftLabel: "検証中… 798 / 1,284 行",
          progressRightLabel: "3 件のエラー · 14 件の警告",
        }}
        errors={[
          {
            line: "L 124",
            message: "日付形式が不正",
            value: "26/5/14",
            severity: "error",
          },
          {
            line: "L 251",
            message: "従業員 ID 未登録",
            value: "EMP-9999",
            severity: "error",
          },
          {
            line: "L 477",
            message: <>残業 &gt; 12h</>,
            value: "14.5",
            severity: "warning",
          },
        ]}
        actions={
          <>
            <Button variant="outline" size="small">
              エラー行を CSV で出力
            </Button>
            <Button size="small">エラー行をスキップして取込</Button>
          </>
        }
      />
    );
  },
};

export const Export_Defaults: Story = {
  name: "Export dialog · defaults",
  parameters: {
    docs: {
      description: {
        story:
          "Default format is `csv-utf8` (BOM — Excel-safe). Range defaults to `current-filter` so the export matches what the user is looking at. The two column checkboxes toggle hidden-column inclusion.",
      },
    },
  },
  render: function ExportDefaults() {
    const [open, setOpen] = useState(true);
    const [format, setFormat] = useState<TableExportFormat>("csv-utf8");
    const [range, setRange] = useState<TableExportRange>("current-filter");
    const [includeHidden, setIncludeHidden] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>エクスポートを開く</Button>
        <TableExportDialog
          open={open}
          onOpenChange={setOpen}
          format={format}
          onFormatChange={setFormat}
          range={range}
          onRangeChange={setRange}
          includeHiddenColumns={includeHidden}
          onIncludeHiddenColumnsChange={setIncludeHidden}
          rangeCounts={{
            currentFilter: 1284,
            selected: 3,
            all: 12408,
          }}
          columnCounts={{ visible: 8, total: 12 }}
          onExport={() => setOpen(false)}
        />
      </>
    );
  },
};
