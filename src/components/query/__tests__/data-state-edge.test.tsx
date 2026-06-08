import { describe, expect, it } from "vitest";
import type { UseQueryResult } from "@tanstack/react-query";
import { renderWithUi, screen } from "@/test/render";

import { DataState } from "../data-state";

const q = <T,>(over: Partial<UseQueryResult<T>>): UseQueryResult<T> =>
  ({ isPending: false, isError: false, ...over }) as UseQueryResult<T>;

describe("DataState — edge data", () => {
  it("shows the skeleton when the query settled but data is undefined", () => {
    renderWithUi(
      <DataState
        query={q({ data: undefined })}
        skeleton={<div>SKELETON</div>}
        empty={<div>EMPTY</div>}
      >
        {() => <div>CONTENT</div>}
      </DataState>,
    );
    expect(screen.getByText("SKELETON")).toBeInTheDocument();
  });

  it("treats a falsy non-null value (0) as empty via defaultIsEmpty", () => {
    renderWithUi(
      <DataState query={q({ data: 0 })} skeleton={<div>SKELETON</div>} empty={<div>EMPTY</div>}>
        {() => <div>CONTENT</div>}
      </DataState>,
    );
    expect(screen.getByText("EMPTY")).toBeInTheDocument();
  });
});
