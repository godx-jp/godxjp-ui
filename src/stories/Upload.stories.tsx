import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FileUp, Paperclip } from "lucide-react";
import { Upload } from "../components/composites/upload";
import type {
  UploadFile,
  UploadRequestParams,
} from "../components/composites/upload";
import { Button } from "../components/primitives/Button";
import { Flex } from "../components/primitives/layout";

/**
 * `Upload` — generic file uploader. Surface mirrors
 * [Ant Design's `<Upload>`](https://ant.design/components/upload) so a
 * consumer switching from antd has a one-to-one mental model:
 *
 * - `multiple` / `accept` / `maxSize` / `maxCount` — selection gates.
 * - `listType` — `"text"` (default), `"picture"`, or `"picture-card"`.
 * - `customRequest({ file, onProgress, signal })` — REQUIRED. Services
 *   own the transport; the composite owns the file picker, drag-drop,
 *   validation, queue state, progress bar, abort, remove + retry.
 * - `beforeUpload(file)` — async gate; return `false` to drop a file.
 * - `fileList` + `defaultFileList` — controlled / uncontrolled.
 * - `onChange` / `onRemove` / `onPreview` — lifecycle hooks.
 * - `trigger` — replace the default dashed area.
 *
 * For image-specific UX (thumbnails, optional crop) use `<ImageUpload>`.
 * For single image + required crop use `<AvatarUploader>`.
 */
const meta: Meta<typeof Upload> = {
  title: "Composites/Upload",
  component: Upload,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Generic file upload composite. Service supplies " +
          "`customRequest` to perform the actual HTTP transport; the " +
          "composite owns picker, drag-drop, validation, queue, progress, " +
          "abort, remove, and retry.",
      },
    },
  },
  argTypes: {
    listType: {
      control: { type: "inline-radio" },
      options: ["text", "picture", "picture-card"],
    },
    multiple: { control: { type: "boolean" } },
    maxSize: { control: { type: "number" } },
    maxCount: { control: { type: "number" } },
    disabled: { control: { type: "boolean" } },
  },
};
export default meta;
type Story = StoryObj<typeof Upload>;

// Fake transport that drives the progress bar from 0 → 100 over ~1s.
const fakeUpload = ({ onProgress, signal }: UploadRequestParams) =>
  new Promise<{ url?: string }>((resolve, reject) => {
    let p = 0;
    const id = setInterval(() => {
      p += 12;
      onProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        resolve({ url: "https://example.com/uploaded" });
      }
    }, 120);
    signal.addEventListener("abort", () => {
      clearInterval(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

const failingUpload = ({ signal }: UploadRequestParams) =>
  new Promise<{ url?: string }>((_, reject) => {
    const t = setTimeout(
      () => reject(new Error("Server rejected (413 Payload Too Large)")),
      400,
    );
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

export const Single: Story = {
  name: "Single file",
  args: {
    multiple: false,
    customRequest: fakeUpload,
  },
};

export const Multiple: Story = {
  name: "Multiple files",
  args: {
    multiple: true,
    customRequest: fakeUpload,
  },
};

export const AcceptPdfDocx: Story = {
  name: "accept · .pdf / .docx",
  args: {
    multiple: true,
    accept: ".pdf,.docx",
    customRequest: fakeUpload,
  },
};

export const MaxSize5MB: Story = {
  name: "maxSize · 5 MB",
  args: {
    multiple: true,
    maxSize: 5 * 1024 * 1024,
    customRequest: fakeUpload,
  },
};

export const MaxCount3: Story = {
  name: "maxCount · 3",
  args: {
    multiple: true,
    maxCount: 3,
    customRequest: fakeUpload,
  },
};

export const BeforeUploadReject: Story = {
  name: "beforeUpload · reject .exe",
  args: {
    multiple: true,
    customRequest: fakeUpload,
    beforeUpload: (file) => !file.name.toLowerCase().endsWith(".exe"),
  },
};

export const DragAndDrop: Story = {
  name: "Drag and drop",
  args: {
    multiple: true,
    customRequest: fakeUpload,
    labels: {
      dropHint: "Drag files here or click to browse",
      dropSubHint: "Drop one or many — they queue immediately",
    },
  },
};

export const ListTypePicture: Story = {
  name: 'listType · "picture"',
  args: {
    multiple: true,
    accept: "image/*",
    listType: "picture",
    customRequest: fakeUpload,
  },
};

export const ListTypePictureCard: Story = {
  name: 'listType · "picture-card"',
  args: {
    multiple: true,
    accept: "image/*",
    listType: "picture-card",
    maxCount: 9,
    customRequest: fakeUpload,
  },
};

export const ControlledFileList: Story = {
  name: "Controlled fileList",
  render: () => {
    function Demo() {
      const [files, setFiles] = useState<UploadFile[]>([
        {
          uid: "seed-1",
          name: "spec-rfc-9457.pdf",
          size: 184_320,
          type: "application/pdf",
          status: "success",
          percent: 100,
          url: "https://example.com/spec-rfc-9457.pdf",
        },
      ]);
      return (
        <Flex vertical gap="middle">
          <Upload
            multiple
            customRequest={fakeUpload}
            fileList={files}
            onChange={setFiles}
          />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
            {files.length} item(s) in state.
          </span>
        </Flex>
      );
    }
    return <Demo />;
  },
};

export const CustomTrigger: Story = {
  name: "Custom trigger slot",
  args: {
    multiple: true,
    customRequest: fakeUpload,
    trigger: (
      <Button variant="secondary">
        <Paperclip size={14} />
        Attach files
      </Button>
    ),
  },
};

export const TriggerButton: Story = {
  name: "Trigger · plain Button",
  args: {
    customRequest: fakeUpload,
    trigger: (
      <Button>
        <FileUp size={14} />
        Choose file
      </Button>
    ),
  },
};

export const FailingTransport: Story = {
  name: "Failing transport (retry)",
  args: {
    multiple: true,
    customRequest: failingUpload,
  },
};

export const Disabled: Story = {
  name: "Disabled",
  args: {
    multiple: true,
    disabled: true,
    customRequest: fakeUpload,
  },
};

export const LocalisedLabels: Story = {
  name: "Localised labels (Japanese)",
  args: {
    multiple: true,
    customRequest: fakeUpload,
    labels: {
      dropHint: "クリックまたはドラッグでアップロード",
      dropSubHint: "複数ファイル対応",
      remove: "削除",
      retry: "再試行",
      preview: "プレビュー",
      rejectedType: "ファイル形式が許可されていません",
      rejectedTooLarge: "{{mb}} MB 以下のファイルを選択してください",
      rejectedTooMany: "最大 {{count}} 件までアップロードできます",
    },
  },
};
