import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Descriptions } from "../descriptions";

describe("Descriptions — column layout", () => {
  it("defaults to a 2-column responsive grid", () => {
    const { container } = render(
      <Descriptions>
        <Descriptions.Item label="名前">山田</Descriptions.Item>
      </Descriptions>,
    );
    const dl = container.querySelector("dl")!;
    expect(dl.className).toContain("sm:grid-cols-2");
    expect(dl.className).not.toContain("lg:grid-cols-3");
  });

  it("renders a single column when columns=1", () => {
    const { container } = render(
      <Descriptions columns={1}>
        <Descriptions.Item label="x">y</Descriptions.Item>
      </Descriptions>,
    );
    const dl = container.querySelector("dl")!;
    expect(dl.className).toContain("grid-cols-1");
    expect(dl.className).not.toContain("sm:grid-cols-2");
  });

  it("renders a three-column grid when columns=3", () => {
    const { container } = render(
      <Descriptions columns={3}>
        <Descriptions.Item label="x">y</Descriptions.Item>
      </Descriptions>,
    );
    expect(container.querySelector("dl")!.className).toContain("lg:grid-cols-3");
  });
});

describe("Descriptions.Item", () => {
  it("renders the label in a dt and the value in a dd", () => {
    render(
      <Descriptions>
        <Descriptions.Item label="メール">a@example.com</Descriptions.Item>
      </Descriptions>,
    );
    const dt = screen.getByText("メール");
    const dd = screen.getByText("a@example.com");
    expect(dt.tagName).toBe("DT");
    expect(dd.tagName).toBe("DD");
  });

  it("applies the mono font for IDs/paths when mono is set", () => {
    render(
      <Descriptions>
        <Descriptions.Item label="ID" mono>
          ord_123
        </Descriptions.Item>
      </Descriptions>,
    );
    expect(screen.getByText("ord_123").className).toContain("font-mono");
  });

  it("defaults to a VERTICAL item (label stacked over value)", () => {
    render(
      <Descriptions>
        <Descriptions.Item label="lbl">val</Descriptions.Item>
      </Descriptions>,
    );
    const item = screen.getByText("lbl").closest("div")!;
    expect(item.className).toContain("gap-[var(--field-label-gap)]");
    expect(item.className).not.toContain("descriptions-label-width");
  });

  it("renders a HORIZONTAL item (label beside value in the token-aligned column)", () => {
    render(
      <Descriptions layout="horizontal">
        <Descriptions.Item label="lbl">val</Descriptions.Item>
      </Descriptions>,
    );
    const item = screen.getByText("lbl").closest("div")!;
    expect(item.className).toContain("grid-cols-[var(--descriptions-label-width)_minmax(0,1fr)]");
    // dt/dd semantics preserved regardless of layout.
    expect(screen.getByText("lbl").tagName).toBe("DT");
    expect(screen.getByText("val").tagName).toBe("DD");
  });

  it("spans two columns when span=2 and three when span=3", () => {
    render(
      <Descriptions columns={3}>
        <Descriptions.Item label="two" span={2}>
          v2
        </Descriptions.Item>
        <Descriptions.Item label="three" span={3}>
          v3
        </Descriptions.Item>
        <Descriptions.Item label="none">v0</Descriptions.Item>
      </Descriptions>,
    );
    expect(screen.getByText("v2").closest("div")!.className).toContain("sm:col-span-2");
    expect(screen.getByText("v3").closest("div")!.className).toContain("lg:col-span-3");
    expect(screen.getByText("v0").closest("div")!.className).not.toContain("col-span");
  });
});
