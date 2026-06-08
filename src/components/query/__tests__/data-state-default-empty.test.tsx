import { describe, expect, it } from "vitest";
import type { UseQueryResult } from "@tanstack/react-query";
import { renderWithUi, screen } from "@/test/render";

import { DataState } from "../data-state";

const loaded = <T,>(data: T): UseQueryResult<T> =>
  ({ isPending: false, isError: false, data }) as UseQueryResult<T>;

function render(data: unknown) {
  renderWithUi(
    <DataState query={loaded(data)} skeleton={<div>SKELETON</div>} empty={<div>EMPTY</div>}>
      {() => <div>CONTENT</div>}
    </DataState>,
  );
}

describe("DataState — defaultIsEmpty", () => {
  it("treats an {items: []} payload as empty and a populated one as content", () => {
    render({ items: [] });
    expect(screen.getByText("EMPTY")).toBeInTheDocument();
  });

  it("treats {items:[…]} as content", () => {
    render({ items: [1, 2] });
    expect(screen.getByText("CONTENT")).toBeInTheDocument();
  });

  it("treats {length: 0} as empty (length-bearing object)", () => {
    render({ length: 0 });
    expect(screen.getByText("EMPTY")).toBeInTheDocument();
  });

  it("treats a plain object without items/length as content (fallback false)", () => {
    render({ foo: 1 });
    expect(screen.getByText("CONTENT")).toBeInTheDocument();
  });

  it("treats an empty array as empty and a non-empty one as content", () => {
    render([]);
    expect(screen.getByText("EMPTY")).toBeInTheDocument();
  });

  it("treats a non-empty array as content", () => {
    render([1]);
    expect(screen.getByText("CONTENT")).toBeInTheDocument();
  });

  it("treats null data as empty when an empty node is provided", () => {
    render(null);
    expect(screen.getByText("EMPTY")).toBeInTheDocument();
  });
});
