import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderWithUi, screen } from "@/test/render";
import {
  Card,
  CardAction,
  CardContent,
  CardCover,
  CardDescription,
  CardFooter,
  CardHeader,
  StatCard,
  CardTitle,
} from "../card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";

describe("Card layout governance", () => {
  it("keeps all slot padding in card-layout.css (not card.tsx)", () => {
    const cardTs = readFileSync(join(__dirname, "../card.tsx"), "utf8");
    expect(cardTs).not.toMatch(/ui-card-shell/);
    expect(cardTs).not.toMatch(/ui-card-section-gap/);
    expect(cardTs).not.toMatch(/padding-(top|bottom|inline)/);

    const layoutCss = readFileSync(join(__dirname, "../../../styles/card-layout.css"), "utf8");
    expect(layoutCss).toMatch(/\[data-slot="card-header"\]/);
    expect(layoutCss).toMatch(/\[data-slot="card-content"\]/);
    expect(layoutCss).toMatch(/\[data-slot="card-footer"\]/);
    expect(layoutCss).toMatch(/--card-space-inset/);
    expect(layoutCss).toMatch(/--card-space-header-y/);
    expect(layoutCss).toMatch(/--card-space-body-y/);
  });
});

describe("Card", () => {
  it("renders header, content, and footer", () => {
    renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>HAWB detail</CardTitle>
          <CardDescription>Osaka → HCM</CardDescription>
        </CardHeader>
        <CardContent>2.4 kg</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "HAWB detail" })).toBeInTheDocument();
    expect(screen.getByText("Osaka → HCM")).toBeInTheDocument();
    expect(screen.getByText("2.4 kg")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders CardAction in header row", () => {
    renderWithUi(
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Section</CardTitle>
          <CardAction>
            <button type="button">Edit</button>
          </CardAction>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("renders separated footer with data-separated flag", () => {
    renderWithUi(
      <Card>
        <CardHeader>
          <CardTitle>Form</CardTitle>
        </CardHeader>
        <CardContent data-testid="content">Body</CardContent>
        <CardFooter separated data-testid="footer">
          <button type="button">Save</button>
        </CardFooter>
      </Card>,
    );
    const footer = screen.getByTestId("footer");
    expect(footer).toHaveAttribute("data-separated", "");
    expect(footer).toHaveAttribute("data-slot", "card-footer");
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "card-content");
  });

  it("renders banded header with data attribute", () => {
    renderWithUi(
      <Card>
        <CardHeader banded data-testid="header">
          <CardTitle>Section</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    const header = screen.getByTestId("header");
    expect(header).toHaveAttribute("data-banded", "");
    expect(header.className).toMatch(/ui-card-header--banded/);
  });

  it("banded header exposes chrome band flags only (padding in CSS)", () => {
    renderWithUi(
      <Card data-testid="card">
        <CardHeader banded data-testid="header">
          <CardTitle>Audit events</CardTitle>
          <CardDescription>Realm internal · last 24h</CardDescription>
        </CardHeader>
        <CardContent data-testid="content">Body copy</CardContent>
      </Card>,
    );
    const header = screen.getByTestId("header");
    expect(header).toHaveAttribute("data-banded", "");
    expect(header.className).toMatch(/ui-card-header--banded/);
    expect(header.className).not.toMatch(/ui-card-shell/);
    expect(screen.getByRole("heading", { name: "Audit events" })).toHaveAttribute(
      "data-slot",
      "card-title",
    );
    expect(screen.getByTestId("content")).not.toHaveAttribute("data-tight");
  });

  it("renders banded header with title and description slots", () => {
    renderWithUi(
      <Card>
        <CardHeader banded>
          <CardTitle>Audit events</CardTitle>
          <CardDescription>Realm internal · last 24h</CardDescription>
        </CardHeader>
        <CardContent>Prop banded trên CardHeader.</CardContent>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Audit events" })).toBeInTheDocument();
    expect(screen.getByText("Realm internal · last 24h")).toHaveAttribute(
      "data-slot",
      "card-description",
    );
    expect(screen.getByText("Prop banded trên CardHeader.")).toBeInTheDocument();
  });

  it("renders banded header with CardAction for toolbar layout", () => {
    renderWithUi(
      <Card>
        <CardHeader banded data-testid="header">
          <div>
            <CardTitle>Lô gom hôm nay</CardTitle>
            <CardDescription>Osaka Hub · cut-off 17:00 JST</CardDescription>
          </div>
          <CardAction>
            <button type="button">Export CSV</button>
          </CardAction>
        </CardHeader>
        <CardContent flush tight>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>GX-001</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>,
    );
    const header = screen.getByTestId("header");
    expect(header.querySelector('[data-slot="card-action"]')).toBeTruthy();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "GX-001" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "GX-001" }).closest("[data-flush]")).toBeTruthy();
  });

  it("plain header has no banded flag; banded header does", () => {
    renderWithUi(
      <div>
        <Card>
          <CardHeader data-testid="plain">
            <CardTitle>Plain header</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader banded data-testid="banded">
            <CardTitle>Banded header</CardTitle>
          </CardHeader>
        </Card>
      </div>,
    );
    expect(screen.getByTestId("plain")).not.toHaveAttribute("data-banded");
    expect(screen.getByTestId("banded")).toHaveAttribute("data-banded", "");
  });

  it("flush tight content sets layout modifier flags", () => {
    renderWithUi(
      <Card>
        <CardHeader banded>
          <CardTitle>Table section</CardTitle>
        </CardHeader>
        <CardContent flush tight data-testid="content">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>HAWB</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>,
    );
    const content = screen.getByTestId("content");
    expect(content).toHaveAttribute("data-tight", "");
    expect(content).toHaveAttribute("data-flush", "");
    expect(content.className).not.toMatch(/ui-card-/);
  });

  it("banded card pairs with separated footer band", () => {
    renderWithUi(
      <Card>
        <CardHeader banded>
          <CardTitle>Lô gom hôm nay</CardTitle>
        </CardHeader>
        <CardContent flush tight>
          Table body
        </CardContent>
        <CardFooter separated data-testid="footer">
          3 / 12 kiện
        </CardFooter>
      </Card>,
    );
    expect(screen.getByTestId("footer")).toHaveAttribute("data-separated", "");
    expect(screen.getByText("3 / 12 kiện")).toBeInTheDocument();
  });

  it("uses section top for toolbar header with CardAction", () => {
    renderWithUi(
      <Card>
        <CardHeader data-testid="header" className="flex flex-row justify-between">
          <CardTitle>Providers</CardTitle>
          <CardAction>
            <button type="button">Cancel</button>
          </CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "card-header");
    expect(
      screen.getByRole("button", { name: "Cancel" }).closest("[data-slot=card-action]"),
    ).toBeTruthy();
  });

  it("renders cover + meta with card-cover slot", () => {
    renderWithUi(
      <Card>
        <CardCover data-testid="cover">Cover</CardCover>
        <CardHeader data-testid="header">
          <CardTitle>Meta</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByTestId("cover")).toHaveAttribute("data-slot", "card-cover");
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "card-header");
  });

  it("marks tight content for symmetric header band spacing", () => {
    renderWithUi(
      <Card>
        <CardHeader data-testid="header">
          <CardTitle>Table</CardTitle>
        </CardHeader>
        <CardContent tight flush data-testid="content">
          Body
        </CardContent>
      </Card>,
    );
    expect(screen.getByTestId("content")).toHaveAttribute("data-tight", "");
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "card-header");
  });

  it("renders solo content with data-solo flag", () => {
    renderWithUi(
      <Card>
        <CardContent solo data-testid="content">
          Only body
        </CardContent>
      </Card>,
    );
    expect(screen.getByTestId("content")).toHaveAttribute("data-solo", "");
  });

  it("StatCard uses compact stat slot token path", () => {
    renderWithUi(
      <StatCard
        label="Đơn hôm nay"
        value={128}
        delta={<span data-testid="delta">+12%</span>}
        data-testid="stat"
      />,
    );
    const card = screen.getByTestId("stat");
    expect(card).toHaveAttribute("data-size", "compact");
    expect(card).toHaveAttribute("data-stat-card", "");
    expect(card).toHaveAttribute("data-stat-layout", "stacked");
    expect(screen.getByText("Đơn hôm nay")).toHaveAttribute("data-slot", "stat-card-label");
    expect(screen.getByText("128")).toHaveAttribute("data-slot", "stat-card-value");
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByTestId("delta")).toBeInTheDocument();
    expect(card.querySelector("[data-slot='stat-card-value-row']")).toBeTruthy();
  });

  it("StatCard color-codes signed deltas and supports inverse semantics", () => {
    const { rerender } = renderWithUi(<StatCard label="Churn" value="4%" delta="-2%" />);

    expect(screen.getByText("-2%")).toHaveClass("text-error-strong");

    rerender(<StatCard label="Churn" value="4%" delta="-2%" inverse />);

    expect(screen.getByText("-2%")).toHaveClass("text-success-strong");
  });
});

describe("Table", () => {
  it("renders semantic table structure", () => {
    renderWithUi(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>HAWB</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>GX-001</TableCell>
            <TableCell>In transit</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "HAWB" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "GX-001" })).toBeInTheDocument();
  });
});

describe("StatCard delta tone", () => {
  function deltaEl(container: HTMLElement): HTMLElement {
    return container.querySelector('[data-slot="stat-card-delta"]') as HTMLElement;
  }

  it("renders label + value, no delta element when delta is omitted", () => {
    const { container } = renderWithUi(<StatCard label="売上" value="¥8.2M" />);
    expect(screen.getByText("売上")).toBeInTheDocument();
    expect(screen.getByText("¥8.2M")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="stat-card-delta"]')).toBeNull();
  });

  it("colours a positive delta (+) with the success tone", () => {
    const { container } = renderWithUi(<StatCard label="x" value="1" delta="+12%" />);
    const delta = deltaEl(container);
    expect(delta.getAttribute("data-delta-tone")).toBe("positive");
    expect(delta.className).toContain("text-success-strong");
  });

  it("colours a negative delta (-) with the destructive tone", () => {
    const { container } = renderWithUi(<StatCard label="x" value="1" delta="-5%" />);
    const delta = deltaEl(container);
    expect(delta.getAttribute("data-delta-tone")).toBe("negative");
    expect(delta.className).toContain("text-error-strong");
  });

  it("flips delta semantics when inverse is set (lower is better)", () => {
    const { container } = renderWithUi(<StatCard label="x" value="1" delta="+12%" inverse />);
    const delta = deltaEl(container);
    expect(delta.getAttribute("data-delta-tone")).toBe("negative");
    expect(delta.className).toContain("text-error-strong");
  });
});
