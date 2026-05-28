import { describe, expect, it } from "vitest";
import { Inbox } from "lucide-react";
import { renderWithUi, screen } from "@/test/render";
import { EmptyState } from "../empty-state";
import { Button } from "../../general/button";
import { Badge } from "../badge";
import { KeyValueGrid } from "../key-value-grid";
import { StatusBadge } from "../status-badge";

describe("EmptyState", () => {
  it("renders title and description", () => {
    renderWithUi(<EmptyState title="No data" description="Try changing filters" />);
    expect(screen.getByRole("heading", { level: 3, name: "No data" })).toBeInTheDocument();
    expect(screen.getByText("Try changing filters")).toBeInTheDocument();
  });

  it("renders icon and action", () => {
    renderWithUi(<EmptyState icon={Inbox} title="Empty" action={<Button>Add</Button>} />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("renders children", () => {
    renderWithUi(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("success variant uses semantic success token (not green-*)", () => {
    renderWithUi(<Badge variant="success">OK</Badge>);
    const el = screen.getByText("OK");
    expect(el.className).toContain("success");
    expect(el.className).not.toMatch(/green-/);
  });
});

describe("KeyValueGrid", () => {
  it("renders label/value pairs via Item children", () => {
    renderWithUi(
      <KeyValueGrid>
        <KeyValueGrid.Item label="ID">01HF</KeyValueGrid.Item>
        <KeyValueGrid.Item label="Status">active</KeyValueGrid.Item>
      </KeyValueGrid>,
    );
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("01HF")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });
});

describe("StatusBadge", () => {
  it("maps known status to label", () => {
    renderWithUi(<StatusBadge status="pending" />);
    expect(screen.getByText("Chờ xử lý")).toBeInTheDocument();
  });

  it("pending tone uses warning token on root badge element", () => {
    renderWithUi(<StatusBadge status="pending" />);
    const text = screen.getByText("Chờ xử lý");
    expect(text.parentElement?.className).toContain("warning");
  });

  it("scheduled tone uses info token on root badge element", () => {
    renderWithUi(<StatusBadge status="scheduled" />);
    const text = screen.getByText("Đã lên lịch");
    expect(text.parentElement?.className).toContain("info");
  });

  it("falls back for unknown status", () => {
    renderWithUi(<StatusBadge status="custom_unknown_xyz" />);
    expect(screen.getByText("custom_unknown_xyz")).toBeInTheDocument();
  });
});
