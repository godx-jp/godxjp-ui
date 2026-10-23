import * as React from "react";
import { describe, expect, it } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { DataTable } from "../data-table";

const name = "A member whose full name must remain recoverable";
const data = [{ id: "1", name }];
function Identity() {
  return <span title={name}>{name}</span>;
}

describe("DataTable custom-renderer text recovery (#1406)", () => {
  it("exposes the full text for both renderers before overflow measurement", () => {
    const { container } = render(
      <DataTable
        data={data}
        columns={[
          {
            key: "name",
            header: "Name",
            ellipsis: true,
            render: (row) => <strong>{row.name}</strong>,
          },
        ]}
      />,
    );
    expect(container.querySelector("tbody td")).toHaveAttribute("title", name);
  });
  it("does not duplicate recovery supplied by an opaque renderer", () => {
    const { container } = render(
      <DataTable
        data={data}
        columns={[{ key: "name", header: "Name", ellipsis: true, render: () => <Identity /> }]}
      />,
    );
    expect(container.querySelector("tbody td")).not.toHaveAttribute("title");
    expect(container.querySelectorAll("[title]")).toHaveLength(1);
  });
  it("does not add a title for a non-ellipsized renderer", () => {
    const { container } = render(
      <DataTable
        data={data}
        columns={[{ key: "name", header: "Name", render: (row) => <strong>{row.name}</strong> }]}
      />,
    );
    expect(container.querySelector("tbody td")).not.toHaveAttribute("title");
  });
  it("leaves renderer-owned tooltip recovery alone", () => {
    const { container } = render(
      <DataTable
        data={data}
        columns={[
          {
            key: "name",
            header: "Name",
            ellipsis: true,
            render: (row) => <span aria-describedby="full-name">{row.name}</span>,
          },
        ]}
      />,
    );
    expect(container.querySelector("tbody td")).not.toHaveAttribute("title");
  });
  it("updates recovery after an opaque renderer changes its own text or tooltip", async () => {
    let change: React.Dispatch<React.SetStateAction<boolean>>;
    function StatefulIdentity() {
      const [tooltip, setTooltip] = React.useState(false);
      change = setTooltip;
      return (
        <span title={tooltip ? "Updated name" : undefined}>{tooltip ? "Updated name" : name}</span>
      );
    }
    const { container } = render(
      <DataTable
        data={data}
        columns={[
          { key: "name", header: "Name", ellipsis: true, render: () => <StatefulIdentity /> },
        ]}
      />,
    );
    expect(container.querySelector("tbody td")).toHaveAttribute("title", name);
    await act(async () => change(true));
    await waitFor(() => expect(container.querySelector("tbody td")).not.toHaveAttribute("title"));
    await act(async () => change(false));
    await waitFor(() => expect(container.querySelector("tbody td")).toHaveAttribute("title", name));
  });
  it.each([0, "", null])("handles a custom scalar %s without inventing content", (value) => {
    const { container } = render(
      <DataTable
        data={[{ id: "1", name: value }]}
        columns={[
          { key: "name", header: "Name", ellipsis: true, render: (row) => <span>{row.name}</span> },
        ]}
      />,
    );
    const cell = container.querySelector("tbody td");
    if (value === 0) expect(cell).toHaveAttribute("title", "0");
    else expect(cell).not.toHaveAttribute("title");
  });
  it("excludes the stacked column label from the cell's full value", () => {
    const { container } = render(
      <DataTable
        preset="stacked-record-collection"
        data={data}
        columns={[
          {
            key: "name",
            header: "Member",
            ellipsis: true,
            render: (row) => <strong>{row.name}</strong>,
          },
        ]}
      />,
    );
    expect(container.querySelector("tbody td")).toHaveAttribute("title", name);
  });
  it("recovers formatted display text rather than an unformatted raw value", () => {
    const { container } = render(
      <DataTable
        data={[{ id: "1", name: 12 }]}
        columns={[
          { key: "name", header: "Name", ellipsis: true, render: () => <span>12 members</span> },
        ]}
      />,
    );
    expect(container.querySelector("tbody td")).toHaveAttribute("title", "12 members");
  });
});
