import { describe, it } from "vitest";
import { expectNoA11yViolations } from "@/test/a11y";
import { RangeTimeline } from "../range-timeline";

describe("RangeTimeline accessibility", () => {
  it("names its region and endpoint actions in read-only and editable modes", async () => {
    const rows = [
      {
        id: "one",
        label: "Task one",
        start: 0,
        end: 2,
        startLabel: "Move start date: September 1",
        endLabel: "Move due date: September 3",
      },
    ];
    const columns = [
      { label: "September 1", units: 1 },
      { label: "September 2", units: 1 },
      { label: "September 3", units: 1 },
    ];
    await expectNoA11yViolations(
      <main>
        <RangeTimeline label="Read-only schedule" rows={rows} columns={columns} />
        <RangeTimeline
          label="Editable schedule"
          rows={rows}
          columns={columns}
          onRangeChange={() => {}}
        />
      </main>,
    );
  });
});
