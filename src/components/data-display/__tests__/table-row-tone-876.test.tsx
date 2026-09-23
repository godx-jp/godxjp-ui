import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { DataTable, type ColumnDef } from "../data-table";
import { Table, TableBody, TableCell, TableRow } from "../table";

/**
 * gh#876 — `tone` promoted to a real, typed prop on `TableRow`. It writes the SAME `data-tone`
 * attribute the primitive already painted from — `DataTable`'s own `rowTone`, and the row state
 * `PermissionMatrix` moved onto the attribute in gh#872. This is an ADDITION, not a migration: a
 * consumer who wrote `data-tone` by hand because the catalog told them to must not find it
 * broken, so every call site below asserts the old spelling still works unchanged.
 */

type Row = { id: string; name: string };
const DATA: Row[] = [
  { id: "a", name: "支店A" },
  { id: "b", name: "支店B" },
];
const COLUMNS: ColumnDef<Row>[] = [{ key: "name", header: "名前" }];

describe("gh#876 — TableRow tone prop", () => {
  it("`tone` writes data-tone, byte-identical to writing the attribute by hand", () => {
    const { container } = renderWithUi(
      <Table>
        <TableBody>
          <TableRow tone="warning" data-testid="via-prop">
            <TableCell>a</TableCell>
          </TableRow>
          <TableRow data-tone="warning" data-testid="via-attribute">
            <TableCell>a</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const viaProp = container.querySelector('[data-testid="via-prop"]')!;
    const viaAttribute = container.querySelector('[data-testid="via-attribute"]')!;
    expect(viaProp).toHaveAttribute("data-tone", "warning");
    expect(viaAttribute).toHaveAttribute("data-tone", "warning");
    // Same class list — `tone` is not a second, parallel decoration with its own paint.
    expect(viaProp.className).toBe(viaAttribute.className);
    // `tone` never leaks onto the DOM as its own attribute — only `data-tone` does.
    expect(viaProp.getAttributeNames().sort()).toEqual(viaAttribute.getAttributeNames().sort());
  });

  it("every TableRowToneProp value round-trips onto data-tone", () => {
    const tones = ["primary", "success", "warning", "info", "attention", "destructive"] as const;
    const { container } = renderWithUi(
      <Table>
        <TableBody>
          {tones.map((tone) => (
            <TableRow key={tone} tone={tone} data-testid={`row-${tone}`}>
              <TableCell>{tone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>,
    );
    for (const tone of tones) {
      expect(container.querySelector(`[data-testid="row-${tone}"]`)).toHaveAttribute(
        "data-tone",
        tone,
      );
    }
  });

  it("the old spelling — `data-tone` written by hand — is untouched", () => {
    const { container } = renderWithUi(
      <Table>
        <TableBody>
          <TableRow data-tone="destructive" data-testid="hand-written">
            <TableCell>1</TableCell>
          </TableRow>
          <TableRow data-expanded-row="" data-testid="unrelated-attribute">
            <TableCell>2</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector('[data-testid="hand-written"]')).toHaveAttribute(
      "data-tone",
      "destructive",
    );
    // An unrelated row attribute (gh#876 did not touch data-expanded-row) still passes through.
    expect(container.querySelector('[data-testid="unrelated-attribute"]')).toHaveAttribute(
      "data-expanded-row",
      "",
    );
  });

  it("omitting tone emits no data-tone attribute at all", () => {
    const { container } = renderWithUi(
      <Table>
        <TableBody>
          <TableRow data-testid="untoned">
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector('[data-testid="untoned"]')).not.toHaveAttribute("data-tone");
  });

  it("DataTable's own `rowTone` still works — the prop is additive, not a replacement", () => {
    const { container } = renderWithUi(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        rowTone={(r) => (r.id === "b" ? "warning" : undefined)}
      />,
    );
    const rows = [...container.querySelectorAll("tbody > tr")];
    expect(rows[0]).not.toHaveAttribute("data-tone");
    expect(rows[1]).toHaveAttribute("data-tone", "warning");
  });
});
