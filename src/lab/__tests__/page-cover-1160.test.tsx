import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { PageContainer } from "../../components/layout/page-container";
import { PageCover } from "../page-cover";
import { renderWithUi, screen, userEvent } from "@/test/render";

/**
 * gh#1160 — the pages app's Notion / note.com page chrome: a cover with an accessible reposition
 * control, the page icon, and the display-size article title.
 */
function Repositionable({ onEnd = () => {} }: { onEnd?: () => void }) {
  const [y, setY] = React.useState(50);
  const [on, setOn] = React.useState(true);
  return (
    <>
      <PageCover
        src="https://example.com/cover.jpg"
        alt="Mountains"
        positionY={y}
        onPositionChange={setY}
        repositioning={on}
        onRepositioningChange={(next) => {
          setOn(next);
          onEnd();
        }}
      />
      <output data-testid="y">{y}</output>
    </>
  );
}

describe("PageCover (gh#1160)", () => {
  it("applies the focal point as object-position and is not a control at rest", () => {
    renderWithUi(<PageCover src="https://example.com/c.jpg" alt="" positionY={30} />);
    expect(document.querySelector("img")).toHaveStyle({ objectPosition: "50% 30%" });
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("is a vertical WAI-ARIA slider while repositioning, driven by the slider keys", async () => {
    const user = userEvent.setup();
    const onEnd = vi.fn();
    renderWithUi(<Repositionable onEnd={onEnd} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-orientation", "vertical");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "100");
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(slider).toHaveAccessibleName();
    slider.focus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByTestId("y")).toHaveTextContent("52");
    await user.keyboard("{PageDown}");
    expect(screen.getByTestId("y")).toHaveTextContent("42");
    await user.keyboard("{End}");
    expect(slider).toHaveAttribute("aria-valuenow", "100");
    await user.keyboard("{ArrowUp}");
    expect(screen.getByTestId("y")).toHaveTextContent("100");
    await user.keyboard("{Home}");
    expect(screen.getByTestId("y")).toHaveTextContent("0");
    await user.keyboard("{Escape}");
    expect(onEnd).toHaveBeenCalled();
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("clamps an out-of-range focal point", () => {
    renderWithUi(<PageCover src="https://example.com/c.jpg" alt="" positionY={140} />);
    expect(document.querySelector("img")).toHaveStyle({ objectPosition: "50% 100%" });
  });
});

describe("PageContainer icon, cover and display title (gh#1160)", () => {
  it("places a banner cover above the header and the icon above the title", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="記事のタイトル"
        headerScale="display"
        icon={<span aria-hidden="true">🚀</span>}
        cover={<PageCover src="https://example.com/c.jpg" alt="" />}
      >
        body
      </PageContainer>,
    );
    const root = container.querySelector(".ui-page-container")!;
    expect(root).toHaveAttribute("data-header-scale", "display");
    expect(root).toHaveAttribute("data-cover", "banner");
    expect(root.firstElementChild).toHaveClass("ui-page-cover-slot");
    const icon = container.querySelector(".ui-page-header-icon")!;
    expect(icon.nextElementSibling?.matches("h1, .ui-page-header-title-row")).toBe(true);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("記事のタイトル");
  });

  it("puts an eyecatch inside the header's reading column instead", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="T"
        cover={<PageCover variant="eyecatch" src="https://example.com/c.jpg" alt="" />}
      >
        body
      </PageContainer>,
    );
    expect(container.querySelector(".ui-page-container")).toHaveAttribute("data-cover", "eyecatch");
    expect(container.querySelector(".ui-page-header .ui-page-cover-slot")).not.toBeNull();
  });

  it("emits nothing new for a page without them", () => {
    const { container } = renderWithUi(<PageContainer title="T">body</PageContainer>);
    const root = container.querySelector(".ui-page-container")!;
    expect(root).not.toHaveAttribute("data-cover");
    expect(root).not.toHaveAttribute("data-header-scale");
    expect(container.querySelector(".ui-page-header-icon")).toBeNull();
  });
});
