import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AvatarUploader } from "../components/composites/upload";
import { Button } from "../components/primitives/Button";
import { Avatar } from "../components/primitives/Avatar";
import { Flex } from "../components/primitives/layout";
import { Camera, Upload as UploadIcon } from "lucide-react";

/**
 * `AvatarUploader` is the pre-configured single-image + required-crop
 * variant of the Upload family. Stages: **idle → cropping → uploading
 * → success / error**.
 *
 * Transport-agnostic — services provide an `onUpload({ blob, file,
 * onProgress, signal })` callback. The composite owns the file picker,
 * MIME / size validation, the [`react-easy-crop`](https://github.com/ValentinH/react-easy-crop)
 * crop UI, the progress bar, abort handling, and the success / error
 * chrome.
 *
 * Slots & props:
 *
 * - `onUpload({ blob, file, onProgress, signal })` — resolve to advance
 *   to the success state, throw to surface an error.
 * - `validate?(file)` — return `null` for OK, a string for an error.
 * - `allowedTypes` / `maxSize` — drives the default validator (JPEG /
 *   PNG / WebP, 5 MiB).
 * - `aspect` / `cropShape` — crop ratio + circle / rect.
 * - `labels` — fully localisable; `rejectedTooLarge` accepts `{{mb}}`.
 * - `errorMapper(err)` — translate a thrown Problem Details / Error
 *   into user copy.
 * - `trigger` — replace the default **Choose image** Button with a
 *   custom React node.
 * - `onSuccess` / `onCancel` — lifecycle hooks.
 *
 * Built from `@godxjp/ui` primitives (Button + Flex + Space), so it
 * picks up density + theme tokens automatically.
 */
const meta: Meta<typeof AvatarUploader> = {
  title: "Composites/AvatarUploader",
  component: AvatarUploader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Single image + required round crop. Pre-configured variant " +
          "of the Upload family. For multi-image galleries or " +
          "no-crop image upload, use `<ImageUpload>`. For generic " +
          "file upload, use `<Upload>`.",
      },
    },
  },
  argTypes: {
    aspect: {
      control: { type: "number", min: 0.25, max: 4, step: 0.25 },
      description: "Crop aspect ratio (width / height).",
    },
    cropShape: {
      control: { type: "inline-radio" },
      options: ["round", "rect"],
    },
    maxSize: {
      control: { type: "number" },
      description: "Max file size in bytes (default 5 MiB).",
    },
    allowedTypes: {
      control: { type: "object" },
      description: "Allowlist of MIME types.",
    },
  },
};
export default meta;
type Story = StoryObj<typeof AvatarUploader>;

// Shared mock uploader — fakes progress over ~1s.
const fakeUpload = ({
  onProgress,
}: {
  onProgress?: (pct: number) => void;
}): Promise<void> =>
  new Promise<void>((resolve) => {
    let p = 0;
    const id = setInterval(() => {
      p += 12;
      onProgress?.(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        resolve();
      }
    }, 150);
  });

const failingUpload = (): Promise<void> =>
  new Promise<void>((_, reject) => {
    setTimeout(
      () => reject(new Error("Server rejected upload (413 Payload Too Large)")),
      400,
    );
  });

export const Default: Story = {
  args: {
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};

export const SquareCrop: Story = {
  name: "Rect crop · 16:9",
  args: {
    cropShape: "rect",
    aspect: 16 / 9,
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};

export const CircleCrop1x1: Story = {
  name: "Round crop · 1:1",
  args: {
    cropShape: "round",
    aspect: 1,
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};

export const LocalisedLabels: Story = {
  name: "Localised labels (Japanese)",
  args: {
    labels: {
      chooseImage: "画像を選択",
      upload: "アップロード",
      cancel: "キャンセル",
      cancelUpload: "中止",
      tryAgain: "再試行",
      uploadSuccess: "アバターを更新しました。",
      change: "変更",
      rejectedType: "JPEG・PNG・WebP のみ対応しています",
      rejectedTooLarge: "{{mb}} MB 以下のファイルを選択してください",
    },
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};

export const StrictValidator2MB: Story = {
  name: "Validator · max 2 MB",
  args: {
    maxSize: 2 * 1024 * 1024,
    validate: (file) =>
      file.size > 2 * 1024 * 1024
        ? `Custom rule: file is ${(file.size / 1024 / 1024).toFixed(1)} MB, max is 2 MB`
        : null,
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};

export const JpegOnly: Story = {
  name: "allowedTypes · JPEG only",
  args: {
    allowedTypes: ["image/jpeg"],
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};

export const WithErrorMapper: Story = {
  name: "errorMapper · ProblemDetails → user copy",
  args: {
    onUpload: () => failingUpload(),
    errorMapper: (err) => {
      // Pretend `err` is an RFC 9457 Problem Details payload.
      if (err instanceof Error && /413/.test(err.message)) {
        return "Image too large. Try one under 5 MB.";
      }
      return "Couldn't upload. Please retry in a moment.";
    },
  },
};

export const CustomTriggerSlot: Story = {
  name: "Custom trigger slot",
  args: {
    trigger: (
      <Button variant="secondary">
        <Camera size={14} />
        Replace photo
      </Button>
    ),
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};

export const TriggerWithAvatar: Story = {
  name: "Trigger · avatar with hover edit",
  args: {
    trigger: (
      <Flex align="center" gap="small">
        <Avatar src="https://i.pravatar.cc/120?u=satoshi" alt="Satoshi">SF</Avatar>
        <Button variant="ghost" size="sm">
          <UploadIcon size={14} />
          Change avatar
        </Button>
      </Flex>
    ),
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};

export const SlowUpload: Story = {
  name: "Slow upload (drives the progress bar)",
  args: {
    onUpload: ({ onProgress }) =>
      new Promise<void>((resolve) => {
        let p = 0;
        const id = setInterval(() => {
          p += 5;
          onProgress?.(Math.min(p, 100));
          if (p >= 100) {
            clearInterval(id);
            resolve();
          }
        }, 200);
      }),
  },
};

export const ControlledStatesDemo: Story = {
  name: "States · idle / success / error driven by buttons",
  render: () => {
    function Demo() {
      const [scenario, setScenario] = useState<"happy" | "fail">("happy");
      return (
        <Flex vertical gap="middle">
          <Flex gap="small">
            <Button
              size="sm"
              variant={scenario === "happy" ? "primary" : "secondary"}
              onClick={() => setScenario("happy")}
            >
              Happy path
            </Button>
            <Button
              size="sm"
              variant={scenario === "fail" ? "primary" : "secondary"}
              onClick={() => setScenario("fail")}
            >
              Failing upload
            </Button>
          </Flex>
          <AvatarUploader
            key={scenario}
            onUpload={({ onProgress }) =>
              scenario === "happy" ? fakeUpload({ onProgress }) : failingUpload()
            }
          />
        </Flex>
      );
    }
    return <Demo />;
  },
};

export const Playground: Story = {
  name: "Playground (Controls)",
  args: {
    cropShape: "round",
    aspect: 1,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    onUpload: ({ onProgress }) => fakeUpload({ onProgress }),
  },
};
