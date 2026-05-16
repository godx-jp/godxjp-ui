import type { Meta, StoryObj } from "@storybook/react";
import { ImageUpload } from "../components/composites/upload";
import type { UploadRequestParams } from "../components/composites/upload";

/**
 * `ImageUpload` — image gallery composite. Wraps `<Upload>` with
 * sensible image defaults:
 *
 * - `allowedTypes` — MIME allowlist (default JPEG/PNG/WebP).
 * - `aspect` + `cropShape` — when `aspect` is set, every selected
 *   image runs through a [`react-easy-crop`](https://github.com/ValentinH/react-easy-crop)
 *   modal before queueing. Skip `aspect` to upload as-is.
 * - `thumbSize` — picture-card edge (default 96 px, Ant's standard).
 * - `customRequest({ file, onProgress, signal })` — REQUIRED. Receives
 *   the cropped `File` when crop is in play; otherwise the source file.
 *
 * Use this for galleries, product photos, banner picks, Google-style
 * "upload up to 9 photos" grids. For a single avatar with required
 * round crop, use `<AvatarUploader>` instead.
 */
const meta: Meta<typeof ImageUpload> = {
  title: "Composites/ImageUpload",
  component: ImageUpload,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Image-only gallery built on top of `<Upload>`. Adds picture-card " +
          "thumbnails and an optional crop step driven by `react-easy-crop`.",
      },
    },
  },
  argTypes: {
    aspect: {
      control: { type: "number", min: 0.5, max: 4, step: 0.25 },
    },
    cropShape: {
      control: { type: "inline-radio" },
      options: ["round", "rect"],
    },
    multiple: { control: { type: "boolean" } },
    maxCount: { control: { type: "number" } },
    disabled: { control: { type: "boolean" } },
  },
};
export default meta;
type Story = StoryObj<typeof ImageUpload>;

const fakeUpload = ({ onProgress, signal }: UploadRequestParams) =>
  new Promise<{ url?: string }>((resolve, reject) => {
    let p = 0;
    const id = setInterval(() => {
      p += 14;
      onProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        resolve({ url: "https://example.com/uploaded.jpg" });
      }
    }, 120);
    signal.addEventListener("abort", () => {
      clearInterval(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

export const GalleryDefault: Story = {
  name: "Gallery · multiple, no crop",
  args: {
    multiple: true,
    maxCount: 12,
    customRequest: fakeUpload,
  },
};

export const GoogleStyle: Story = {
  name: "Google Photos · up to 9 squares",
  args: {
    multiple: true,
    maxCount: 9,
    customRequest: fakeUpload,
  },
};

export const WithCrop: Story = {
  name: "Crop · 16:9 rect",
  args: {
    multiple: true,
    maxCount: 4,
    aspect: 16 / 9,
    cropShape: "rect",
    customRequest: fakeUpload,
  },
};

export const RoundCrop: Story = {
  name: "Crop · round",
  args: {
    multiple: false,
    aspect: 1,
    cropShape: "round",
    customRequest: fakeUpload,
  },
};

export const MaxCount5: Story = {
  name: "maxCount · 5",
  args: {
    multiple: true,
    maxCount: 5,
    customRequest: fakeUpload,
  },
};

export const JpegOnly: Story = {
  name: "allowedTypes · JPEG only",
  args: {
    multiple: true,
    allowedTypes: ["image/jpeg"],
    customRequest: fakeUpload,
  },
};

export const SingleNoCrop: Story = {
  name: "Single, no crop",
  args: {
    multiple: false,
    customRequest: fakeUpload,
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
