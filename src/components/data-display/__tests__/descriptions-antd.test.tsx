// antd 6.6.2 parity for Descriptions — `bordered`, the responsive `column` object, the `items`
// API and antd's `span` forms. The 1|2|3 / span 2|3 ladders this library already painted are
// covered by descriptions.test.tsx and must stay byte-identical.
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Descriptions } from "../descriptions";

describe("Descriptions — antd `bordered`", () => {
  it("flags the bordered grid so the stylesheet can draw the cell rules", () => {
    const { container } = render(
      <Descriptions bordered>
        <Descriptions.Item label="名前">山田</Descriptions.Item>
      </Descriptions>,
    );
    expect(container.querySelector("dl")).toHaveAttribute("data-bordered", "");
  });

  it("adds no attribute at all by default", () => {
    const { container } = render(
      <Descriptions>
        <Descriptions.Item label="名前">山田</Descriptions.Item>
      </Descriptions>,
    );
    expect(container.querySelector("dl")).not.toHaveAttribute("data-bordered");
  });

  it("reflects the item layout so a horizontal label cell can carry its own rule", () => {
    const { container } = render(
      <Descriptions bordered layout="horizontal">
        <Descriptions.Item label="名前">山田</Descriptions.Item>
      </Descriptions>,
    );
    expect(container.querySelector('[data-slot="descriptions-item"]')).toHaveAttribute(
      "data-layout",
      "horizontal",
    );
  });
});

describe("Descriptions — antd responsive `column`", () => {
  it("publishes one custom property per declared breakpoint", () => {
    const { container } = render(
      <Descriptions columns={{ sm: 2, lg: 4 }}>
        <Descriptions.Item label="名前">山田</Descriptions.Item>
      </Descriptions>,
    );
    const dl = container.querySelector("dl") as HTMLElement;
    expect(dl).toHaveAttribute("data-columns-responsive", "");
    expect(dl.style.getPropertyValue("--descriptions-column-count-base")).toBe("1");
    expect(dl.style.getPropertyValue("--descriptions-column-count-sm")).toBe("2");
    expect(dl.style.getPropertyValue("--descriptions-column-count-lg")).toBe("4");
    // Undeclared steps stay unset so the ladder falls back through the narrower ones.
    expect(dl.style.getPropertyValue("--descriptions-column-count-md")).toBe("");
  });

  it("drives a 4-column grid off the same ladder rather than a class-name fork", () => {
    const { container } = render(
      <Descriptions columns={4}>
        <Descriptions.Item label="名前">山田</Descriptions.Item>
      </Descriptions>,
    );
    const dl = container.querySelector("dl") as HTMLElement;
    expect(dl).toHaveAttribute("data-columns-responsive", "");
    expect(dl.style.getPropertyValue("--descriptions-column-count-lg")).toBe("4");
  });

  it("leaves the 1|2|3 ladder on its own utilities — nothing is republished", () => {
    const { container } = render(
      <Descriptions columns={3}>
        <Descriptions.Item label="名前">山田</Descriptions.Item>
      </Descriptions>,
    );
    const dl = container.querySelector("dl") as HTMLElement;
    expect(dl).not.toHaveAttribute("data-columns-responsive");
    expect(dl.style.getPropertyValue("--descriptions-column-count-base")).toBe("");
  });
});

describe("Descriptions — antd `items`", () => {
  it("renders items as real dt/dd pairs", () => {
    render(
      <Descriptions
        items={[
          { key: "a", label: "会員ID", value: "m_1", mono: true },
          { key: "b", label: "プラン", children: "Pro" },
        ]}
      />,
    );
    expect(screen.getByText("会員ID").tagName).toBe("DT");
    expect(screen.getByText("m_1").tagName).toBe("DD");
    expect(screen.getByText("m_1")).toHaveAttribute("data-mono", "");
    expect(screen.getByText("Pro").tagName).toBe("DD");
  });

  it("lets items and children coexist, items first", () => {
    const { container } = render(
      <Descriptions items={[{ label: "先", value: "1" }]}>
        <Descriptions.Item label="後">2</Descriptions.Item>
      </Descriptions>,
    );
    const labels = Array.from(container.querySelectorAll("dt")).map((dt) => dt.textContent);
    expect(labels).toEqual(["先", "後"]);
  });
});

describe("Descriptions — antd `span`", () => {
  it('takes the whole remaining row for span="filled"', () => {
    render(
      <Descriptions columns={3}>
        <Descriptions.Item label="メモ" span="filled">
          長い値
        </Descriptions.Item>
      </Descriptions>,
    );
    expect(screen.getByText("長い値").closest("div")).toHaveAttribute("data-span", "filled");
  });

  it("publishes a responsive span per breakpoint", () => {
    render(
      <Descriptions columns={{ sm: 2, lg: 4 }}>
        <Descriptions.Item label="メモ" span={{ sm: 2, lg: 3 }}>
          長い値
        </Descriptions.Item>
      </Descriptions>,
    );
    const item = screen.getByText("長い値").closest("div") as HTMLElement;
    expect(item).toHaveAttribute("data-span-responsive", "");
    expect(item.style.getPropertyValue("--descriptions-item-span-sm")).toBe("2");
    expect(item.style.getPropertyValue("--descriptions-item-span-lg")).toBe("3");
  });

  it("leaves the 2|3 ladder on its own utilities", () => {
    render(
      <Descriptions columns={3}>
        <Descriptions.Item label="メモ" span={2}>
          長い値
        </Descriptions.Item>
      </Descriptions>,
    );
    const item = screen.getByText("長い値").closest("div") as HTMLElement;
    expect(item).not.toHaveAttribute("data-span-responsive");
    expect(item).not.toHaveAttribute("data-span");
  });
});
