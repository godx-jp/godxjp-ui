import { describe, expect, it } from "vitest";
import { Inbox } from "lucide-react";
import { renderWithUi, screen } from "@/test/render";
import { EmptyState } from "../empty-state";
import { Button } from "../../general/button";
import { Badge } from "../badge";
import { Descriptions } from "../descriptions";

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

describe("Descriptions", () => {
  it("renders label/value pairs via Item children", () => {
    renderWithUi(
      <Descriptions>
        <Descriptions.Item label="ID">01HF</Descriptions.Item>
        <Descriptions.Item label="Status">active</Descriptions.Item>
      </Descriptions>,
    );
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("01HF")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("maps known status to label", () => {
    renderWithUi(<Badge status="pending" />);
    expect(screen.getByText("Chờ xử lý")).toBeInTheDocument();
  });

  it("pending tone uses warning token on root badge element", () => {
    renderWithUi(<Badge status="pending" />);
    const text = screen.getByText("Chờ xử lý");
    expect(text.closest('[data-slot="badge"]')?.className).toContain("warning");
  });

  it("scheduled tone uses info token on root badge element", () => {
    renderWithUi(<Badge status="scheduled" />);
    const text = screen.getByText("Đã lên lịch");
    expect(text.closest('[data-slot="badge"]')?.className).toContain("info");
  });

  it("falls back for unknown status", () => {
    renderWithUi(<Badge status="custom_unknown_xyz" />);
    expect(screen.getByText("custom_unknown_xyz")).toBeInTheDocument();
  });
});
