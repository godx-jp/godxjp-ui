import { describe, it } from "vitest";

import { SearchInput } from "../search-input";
import { expectNoA11yViolations } from "@/test/a11y";

describe("SearchInput a11y", () => {
  it("has no axe violations (visible label)", async () => {
    await expectNoA11yViolations(<SearchInput label="伝票検索" onSearch={() => undefined} />);
  });

  it("has no axe violations (ariaLabel only, has value + clear button)", async () => {
    await expectNoA11yViolations(
      <SearchInput ariaLabel="検索" defaultValue="現金" onSearch={() => undefined} />,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(
      <SearchInput ariaLabel="検索" defaultValue="売上" disabled onSearch={() => undefined} />,
    );
  });
});
