import type { Meta, StoryObj } from "@storybook/react";
import { Upload } from "../../components/composites/upload/Upload";
import {
  MediaUpload,
  MediaUploadSingle,
  MediaUploadMultiple,
  MediaUploadAvatar,
} from "../../components/composites/upload/MediaUpload";
import { Flex } from "../../components/layout";

/**
 * data-entry/Upload — file + media uploaders.
 *
 *   - `Upload`            generic file uploader (drag-and-drop).
 *   - `MediaUpload.Single`   single-image + auto-fetch from UUID.
 *   - `MediaUpload.Multiple` gallery + batch auto-fetch.
 *   - `MediaUpload.Avatar`   round crop + auto-fetch.
 *
 * MediaUpload integrates with media-service: pass either a
 * `MediaItem` (full metadata) or a bare UUID string and the
 * component fetches the signed view URL via `fetchMedia` /
 * `fetchMediaBatch`. In Storybook the backend is unreachable; the
 * UUID stories therefore render the fallback "Media not available"
 * state with a `data-media-uuid` attribute on the rendered tile so
 * the consumer can verify which UUID was requested.
 *
 * Cardinal rules honoured:
 *   §14 — fetch() transport; no extra runtime dep.
 *   §19 — generic, no service-specific copy.
 *   §22 — token-pinned visual layer (.media-upload-* in 65-upload.css).
 *   §25 — story is documentation; primitive is the UI.
 */

const meta: Meta = {
  title: "Data Entry/Upload",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Upload family. `Upload` for generic files; `MediaUpload.*` for media-service-backed images with UUID auto-resolution.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

// ─── Generic file upload ──────────────────────────────────────────

export const Generic_File: Story = {
  name: "Generic · File",
  render: () => (
    <Upload
      customRequest={async ({ onProgress }) => {
        // Storybook stub — pretend the server took the bytes.
        for (let p = 0; p <= 100; p += 10) {
          onProgress(p);
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 60));
        }
        return { url: "blob:storybook" };
      }}
      multiple
    />
  ),
};

// ─── MediaUpload.Single ───────────────────────────────────────────

export const Image_Single: Story = {
  name: "Image · Single (square)",
  render: () => (
    <MediaUploadSingle
      defaultValue={{
        id: "demo-1",
        filename: "demo.png",
        contentType: "image/png",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
      }}
      shape="square"
      onValueChange={() => {}}
    />
  ),
};

export const Image_Single_Circle: Story = {
  name: "Image · Single (circle)",
  render: () => (
    <MediaUploadSingle
      defaultValue={{
        id: "demo-2",
        filename: "demo.png",
        contentType: "image/png",
        url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
      }}
      shape="circle"
    />
  ),
};

export const Image_Single_FromUUID: Story = {
  name: "Image · Single (from UUID)",
  parameters: {
    docs: {
      description: {
        story:
          "Pass a UUID string and the component auto-fetches via fetchMedia(). Storybook has no media-service backend so this renders the fallback tile with the requested UUID visible on `data-media-uuid`.",
      },
    },
  },
  render: () => (
    <MediaUploadSingle value="00000000-0000-0000-0000-000000000001" />
  ),
};

// ─── MediaUpload.Multiple ─────────────────────────────────────────

export const Image_Multiple: Story = {
  name: "Image · Multiple (gallery)",
  render: () => (
    <MediaUploadMultiple
      defaultValue={[
        {
          id: "g-1",
          filename: "a.jpg",
          contentType: "image/jpeg",
          url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=200",
        },
        {
          id: "g-2",
          filename: "b.jpg",
          contentType: "image/jpeg",
          url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
        },
      ]}
      maxCount={8}
    />
  ),
};

export const Image_Multiple_FromUUIDs: Story = {
  name: "Image · Multiple (from UUIDs)",
  parameters: {
    docs: {
      description: {
        story:
          "Pass an array of UUIDs and the component batch-fetches via fetchMediaBatch(). In Storybook each failed fetch surfaces as an error tile with the UUID visible.",
      },
    },
  },
  render: () => (
    <MediaUploadMultiple
      value={[
        "00000000-0000-0000-0000-000000000001",
        "00000000-0000-0000-0000-000000000002",
        "00000000-0000-0000-0000-000000000003",
      ]}
      maxCount={8}
    />
  ),
};

// ─── MediaUpload.Avatar ───────────────────────────────────────────

export const Avatar_Crop: Story = {
  name: "Avatar · Crop",
  render: () => (
    <Flex vertical gap="middle">
      <MediaUploadAvatar aspect={1} />
    </Flex>
  ),
};

export const Avatar_FromUUID: Story = {
  name: "Avatar · From UUID",
  parameters: {
    docs: {
      description: {
        story:
          "Pre-bound to a UUID. Auto-fetch fails in Storybook; the preview shows the N/A fallback while the AvatarUploader trigger stays usable.",
      },
    },
  },
  render: () => (
    <MediaUploadAvatar value="00000000-0000-0000-0000-000000000099" />
  ),
};

// ─── Namespace re-export sanity ───────────────────────────────────

export const Namespace_Access: Story = {
  name: "Namespace · MediaUpload.*",
  render: () => (
    <Flex gap="middle" align="start">
      <MediaUpload.Single
        defaultValue={{
          id: "n-1",
          filename: "n.png",
          contentType: "image/png",
          url: "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=200",
        }}
      />
      <MediaUpload.Avatar
        defaultValue={{
          id: "n-2",
          filename: "n.png",
          contentType: "image/png",
          url: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200",
        }}
      />
    </Flex>
  ),
};
