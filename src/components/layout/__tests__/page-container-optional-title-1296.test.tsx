import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { PageContainer } from "../page-container";

/**
 * gh#1296 · 7 — `title` is optional for a page whose content draws its own heading (a reader whose
 * document component owns the `<h1>`). Omitted, PageContainer renders NO `<h1>` at all — an empty
 * heading is an axe `empty-heading` violation and a second `<h1>` would split the outline — and the
 * page's one `<h1>` comes from the content.
 */
describe("PageContainer without a title", () => {
  it("renders no heading of its own, so the content's <h1> is the page's only one", () => {
    const { container } = renderWithUi(
      <PageContainer>
        <h1>利用規約</h1>
      </PageContainer>,
    );
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("利用規約");
    expect(container.querySelector(".ui-page-title")).toBeNull();
  });

  it("drops the empty header band entirely when nothing would be in it", () => {
    const { container } = renderWithUi(
      <PageContainer>
        <h1>Doc</h1>
      </PageContainer>,
    );
    expect(container.querySelector(".ui-page-header")).toBeNull();
    expect(container.querySelector(".ui-page-body")).toHaveTextContent("Doc");
  });

  it("keeps the header for its other slots, still without an <h1>", () => {
    const { container } = renderWithUi(
      <PageContainer
        breadcrumb={[{ label: "Docs", to: "/docs" }, { label: "Terms" }]}
        extra={<button type="button">Edit</button>}
      >
        <h1>Terms</h1>
      </PageContainer>,
    );
    const header = container.querySelector(".ui-page-header");
    expect(header).not.toBeNull();
    expect(header!.querySelector("h1")).toBeNull();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it('shows a footerReveal="onScroll" footer at rest when there is no header to scroll past', () => {
    const { container } = renderWithUi(
      <PageContainer stickyFooter footerReveal="onScroll" footer={<span>Save</span>}>
        <h1>Doc</h1>
      </PageContainer>,
    );
    expect(container.querySelector(".ui-page-container--reveal-footer")).toBeNull();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("still renders the <h1> when a title is given", () => {
    renderWithUi(<PageContainer title="Orders">body</PageContainer>);
    expect(screen.getByRole("heading", { level: 1, name: "Orders" })).toBeInTheDocument();
  });
});
