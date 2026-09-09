/** Folder drops use entry readers because DataTransfer.files contains only the top-level items. */
export async function readDroppedFiles(
  transfer: DataTransfer,
  directory: boolean,
): Promise<File[]> {
  if (!directory || !transfer.items?.length) return Array.from(transfer.files);
  const entries = Array.from(transfer.items)
    .map((item) => item.webkitGetAsEntry?.())
    .filter((entry): entry is FileSystemEntry => entry != null);
  if (!entries.length) return Array.from(transfer.files);
  const result: File[] = [];
  const visit = async (entry: FileSystemEntry, parent: string) => {
    const path = parent ? `${parent}/${entry.name}` : entry.name;
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) =>
        (entry as FileSystemFileEntry).file(resolve, reject),
      );
      Object.defineProperty(file, "webkitRelativePath", { value: path, configurable: true });
      result.push(file);
      return;
    }
    if (!entry.isDirectory) return;
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    for (;;) {
      const children = await new Promise<FileSystemEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject),
      );
      if (!children.length) break;
      for (const child of children) await visit(child, path);
    }
  };
  for (const entry of entries) await visit(entry, "");
  return result;
}
