import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { MasterDetail } from "../master-detail";

describe("MasterDetail", () => {
  it("renders named master and detail regions with standard rail geometry by default", () => {
    const { container, getByRole } = render(
      <MasterDetail
        master={<button type="button">Service A</button>}
        masterLabel="Services"
        detailLabel="Selected service"
      >
        <h2>Service A roles</h2>
      </MasterDetail>,
    );

    expect(getByRole("region", { name: "Services" })).toHaveTextContent("Service A");
    expect(getByRole("region", { name: "Selected service" })).toHaveTextContent("Service A roles");
    expect(container.querySelector(".ui-master-detail")).toHaveAttribute(
      "data-rail-width",
      "standard",
    );
  });

  it("supports the compact 300px master rail preset", () => {
    const { container } = render(
      <MasterDetail master={<div>Master</div>} railWidth="compact">
        Detail
      </MasterDetail>,
    );

    expect(container.querySelector(".ui-master-detail")).toHaveAttribute(
      "data-rail-width",
      "compact",
    );
  });

  it("does not override consumer-owned selection semantics", () => {
    const { getByRole } = render(
      <MasterDetail
        master={
          <button type="button" aria-pressed="true">
            Selected service
          </button>
        }
      >
        Detail
      </MasterDetail>,
    );

    expect(getByRole("button", { pressed: true })).toHaveTextContent("Selected service");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <MasterDetail
        master={
          <button type="button" aria-pressed="true">
            Service A
          </button>
        }
        masterLabel="Services"
        detailLabel="Selected service details"
      >
        <h2>Roles</h2>
      </MasterDetail>,
    );
  });
});
