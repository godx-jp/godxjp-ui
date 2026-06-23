import { describe, it } from "vitest";

import { UploadCropDialog } from "../upload-crop-dialog";
import { expectNoA11yViolations } from "@/test/a11y";

function makeFile() {
  return new File([new Uint8Array([1, 2, 3])], "avatar.png", { type: "image/png" });
}

describe("UploadCropDialog a11y", () => {
  it("has no axe violations (open, with a selected file)", async () => {
    await expectNoA11yViolations(
      <UploadCropDialog
        open
        onOpenChange={() => undefined}
        file={makeFile()}
        onConfirm={() => undefined}
      />,
    );
  });

  it("has no axe violations (open, no file yet)", async () => {
    await expectNoA11yViolations(
      <UploadCropDialog
        open
        onOpenChange={() => undefined}
        file={null}
        onConfirm={() => undefined}
      />,
    );
  });
});
