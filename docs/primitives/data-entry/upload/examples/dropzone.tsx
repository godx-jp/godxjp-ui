import { useState } from "react";

import { Upload, type UploadFileItem } from "@godxjp/ui/data-entry";

async function mockUpload(file: File): Promise<{ mediaId: string; previewUrl?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return {
    mediaId: `temp-${crypto.randomUUID().slice(0, 8)}`,
    previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
  };
}

export default function Demo() {
  const [items, setItems] = useState<UploadFileItem[]>([]);

  return (
    <Upload
      variant="dropzone"
      value={items}
      onValueChange={setItems}
      maxCount={5}
      onUpload={mockUpload}
      className="max-w-lg"
    />
  );
}
