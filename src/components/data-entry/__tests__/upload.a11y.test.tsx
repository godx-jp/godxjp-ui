import { describe, it } from "vitest";

import { Upload } from "../upload";
import type { UploadFileItemProp } from "../upload";
import { expectNoA11yViolations } from "@/test/a11y";

const ITEMS: UploadFileItemProp[] = [
  {
    uid: "1",
    name: "manifest.pdf",
    size: 102_400,
    status: "done",
    mediaId: "media-abc12345",
  },
  {
    uid: "2",
    name: "photo.jpg",
    size: 512_000,
    status: "error",
    error: "アップロードに失敗しました",
  },
];

describe("Upload a11y", () => {
  it("has no axe violations (dropzone, empty)", async () => {
    await expectNoA11yViolations(<Upload variant="dropzone" />);
  });

  it("has no axe violations (dropzone with file list)", async () => {
    await expectNoA11yViolations(<Upload variant="dropzone" value={ITEMS} />);
  });

  it("has no axe violations (button variant)", async () => {
    await expectNoA11yViolations(<Upload variant="button" />);
  });

  it("has no axe violations (picture-card with items)", async () => {
    await expectNoA11yViolations(<Upload variant="picture-card" value={ITEMS} maxCount={5} />);
  });

  it("has no axe violations (avatar)", async () => {
    await expectNoA11yViolations(<Upload variant="avatar" />);
  });

  it("has no axe violations (disabled dropzone)", async () => {
    await expectNoA11yViolations(<Upload variant="dropzone" value={ITEMS} disabled />);
  });
});
