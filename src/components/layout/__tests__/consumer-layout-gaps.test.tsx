import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Flex } from "../flex";
import { ResponsiveGrid } from "../responsive-grid";
import { PageContainer } from "../page-container";
import { Separator } from "../separator";
import { Topbar } from "../topbar";
import { Text } from "../../general/typography";
import { CodeBlock } from "../../data-display/code-block";
import { CardBar } from "../../data-display/card";
import { Textarea } from "../../data-entry/textarea";

describe("Consumer layout contracts", () => {
  it.each(["ul", "ol"] as const)("preserves %s list and item semantics", (as) => {
    renderWithUi(
      <Flex as={as} direction="col">
        <Flex as="li">First</Flex>
      </Flex>,
    );
    expect(screen.getByRole("list").tagName.toLowerCase()).toBe(as);
    expect(screen.getByRole("listitem")).toHaveTextContent("First");
  });
  it("responds by axis and represents a real list without consumer utilities", () => {
    renderWithUi(
      <Flex as="ul" direction={{ base: "col", lg: "row" }} gap="md">
        <li>First</li>
        <li>Second</li>
      </Flex>,
    );
    expect(screen.getByRole("list")).toHaveAttribute("data-direction", "responsive");
    expect(screen.getByRole("list").style.getPropertyValue("--flex-direction-base")).toBe("column");
    expect(screen.getByRole("list").style.getPropertyValue("--flex-direction-lg")).toBe("row");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
  it("grid owns padding and responsive spans", () => {
    const { container } = renderWithUi(
      <ResponsiveGrid columns={{ base: 1, lg: 3 }} pad={{ inline: 3, block: 2 }}>
        <ResponsiveGrid.Item span={{ base: 1, lg: 2 }}>Main</ResponsiveGrid.Item>
        <div>Rail</div>
      </ResponsiveGrid>,
    );
    expect(screen.getByText("Main").style.getPropertyValue("--responsive-grid-item-lg")).toBe("2");
    expect(container.querySelector("[data-flow]")).toBeNull();
    expect(screen.getByText("Main").parentElement?.style.paddingInlineStart).toBe("var(--space-3)");
  });
  it("instance padding does not leak onto sibling page chrome", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="Tasks"
        toolbar="Tools"
        footer="Footer"
        toolbarPad={{ block: 2 }}
        footerPad={3}
      >
        Body
      </PageContainer>,
    );
    expect(screen.getByText("Tools").style.paddingBlockStart).toBe("var(--space-2)");
    expect(screen.getByText("Footer").style.padding).toBe("var(--space-3)");
    expect(container.firstElementChild?.getAttribute("style")).toBeNull();
  });
  it("keeps inline code semantic, and decorations explicit", () => {
    renderWithUi(
      <Text as="code" chip decoration="line-through">
        old_api
      </Text>,
    );
    const text = screen.getByText("old_api");
    expect(text.tagName).toBe("CODE");
    expect(text).toHaveAttribute("data-chip");
    expect(text).toHaveAttribute("data-decoration", "line-through");
  });
  it("code height can be set for one instance", () => {
    renderWithUi(<CodeBlock maxHeight={{ value: "16rem" }}>Long log</CodeBlock>);
    expect(screen.getByText("Long log").parentElement?.style.maxBlockSize).toBe("16rem");
    expect(screen.getByText("Long log").parentElement).toHaveAttribute("tabindex", "0");
  });
  it("card bar owns its padding and chosen divider edge", () => {
    renderWithUi(
      <CardBar pad={{ block: 2, inline: 3 }} gap="sm" surface="muted" border="block-start">
        Tools
      </CardBar>,
    );
    const bar = screen.getByText("Tools").parentElement!;
    expect(bar).toHaveAttribute("data-border", "block-start");
    expect(bar.style.paddingInlineStart).toBe("var(--space-3)");
  });
  it("textarea supports asymmetric inset on the real editor", () => {
    renderWithUi(
      <Textarea aria-label="Message" pad={{ blockStart: 3 }} padRaw={{ blockEnd: 10 }} />,
    );
    expect(screen.getByRole("textbox").style.paddingBlockStart).toBe("var(--space-3)");
    expect(screen.getByRole("textbox").style.paddingBlockEnd).toBe("10px");
  });
  it("separator size and visibility do not lose the accessible label", () => {
    renderWithUi(<Separator label="New messages" labelSize="2xs" space={6} hideFrom="lg" />);
    expect(screen.getByRole("separator", { name: "New messages" })).toHaveAttribute(
      "data-hide-from",
      "lg",
    );
    expect(screen.getByRole("separator").style.marginBlock).toBe("var(--space-6)");
  });
  it("nested topbar uses shell geometry without a second banner", () => {
    renderWithUi(<Topbar height="bar" pad={3} start="Thread" />);
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.getByText("Thread").parentElement).toHaveAttribute("data-height", "bar");
  });
});
