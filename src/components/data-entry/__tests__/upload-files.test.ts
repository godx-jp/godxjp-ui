import { describe, expect, it } from "vitest";
import { readDroppedFiles } from "../upload-files";

describe("directory drops", () => {
  it("drains all directory batches and retains nested relative paths", async () => {
    const leaf = (name: string) => ({
      name,
      isFile: true,
      isDirectory: false,
      file: (resolve: (file: File) => void) => resolve(new File([name], name)),
    });
    const directory = (name: string, batches: unknown[][]) => ({
      name,
      isFile: false,
      isDirectory: true,
      createReader: () => ({
        readEntries: (resolve: (entries: unknown[]) => void) => resolve(batches.shift() ?? []),
      }),
    });
    const root = directory("reports", [
      [leaf("a.txt")],
      [directory("nested", [[leaf("b.txt")], []])],
      [],
    ]);
    const transfer = {
      items: [{ webkitGetAsEntry: () => root }],
      files: [],
    } as unknown as DataTransfer;
    const files = await readDroppedFiles(transfer, true);
    expect(files.map((file) => file.webkitRelativePath)).toEqual([
      "reports/a.txt",
      "reports/nested/b.txt",
    ]);
  });
  it("falls back to regular files when directory entry APIs are unavailable", async () => {
    const file = new File(["x"], "a.txt");
    expect(
      await readDroppedFiles({ items: [{}], files: [file] } as unknown as DataTransfer, true),
    ).toEqual([file]);
  });
});
