// <ImageUpload> — image-only gallery. Wraps <Upload> with sensible
// defaults: image MIME filter, `picture-card` listType, thumbnail
// previews, and an optional crop step (round or rect) per Ant's
// imgCrop pattern.
//
// For SINGLE image with required crop (e.g. avatar), prefer
// <AvatarUploader> which is the pre-configured variant.

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Check, X } from "lucide-react";
import { Button } from "../../general/Button";
import { Flex, Space } from "../../layout";
import { Upload } from "./Upload";
import type {
  UploadCustomRequest,
  UploadFile,
  UploadProps,
} from "./shared/types";

export interface ImageUploadProps
  extends Omit<UploadProps, "listType" | "accept" | "customRequest"> {
  /** MIME allowlist for images (default JPEG/PNG/WebP). */
  allowedTypes?: string[];
  /** Optional crop aspect — when set, every selected image runs through the cropper. */
  aspect?: number;
  /** Crop shape — `round` for avatars, `rect` for banners. Default `rect`. */
  cropShape?: "round" | "rect";
  /** Picture-card edge in px (default 96 — Ant's picture-card). */
  thumbSize?: number;
  /** Service transport — same shape as <Upload>'s customRequest. */
  customRequest: UploadCustomRequest;
  /** Localised cropper labels. */
  cropLabels?: {
    confirm: string;
    cancel: string;
    zoom: string;
  };
}

const DEFAULT_ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const DEFAULT_CROP_LABELS = {
  confirm: "Apply",
  cancel: "Cancel",
  zoom: "Zoom",
};

async function cropImageToBlob(
  imageSrc: string,
  area: Area,
  mime: string,
): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      mime,
      0.95,
    );
  });
}

export function ImageUpload({
  allowedTypes = DEFAULT_ALLOWED,
  aspect,
  cropShape = "rect",
  thumbSize: _thumbSize = 96,
  customRequest,
  cropLabels: cropLabelOverrides,
  beforeUpload,
  ...rest
}: ImageUploadProps) {
  const cropLabels = { ...DEFAULT_CROP_LABELS, ...(cropLabelOverrides ?? {}) };
  const accept = allowedTypes.join(",");

  // Crop modal state — only used when `aspect` is set.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  // Gate to make the original <Upload> accept the cropped File via beforeUpload.
  const cropResolver = useRef<((ok: boolean) => void) | null>(null);
  const replaceWith = useRef<File | null>(null);

  useEffect(() => {
    return () => {
      if (pendingSrc?.startsWith("blob:")) URL.revokeObjectURL(pendingSrc);
    };
  }, [pendingSrc]);

  const handleBeforeUpload = useCallback(
    async (file: File): Promise<boolean> => {
      // Run consumer's beforeUpload first; if they reject, drop here.
      if (beforeUpload) {
        const ok = await beforeUpload(file);
        if (!ok) return false;
      }
      // No crop requested → straight through.
      if (aspect === undefined) return true;

      // Spin up the crop modal and wait for confirm / cancel.
      const src = URL.createObjectURL(file);
      setPendingFile(file);
      setPendingSrc(src);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
      replaceWith.current = null;

      return new Promise<boolean>((resolve) => {
        cropResolver.current = resolve;
      });
    },
    [aspect, beforeUpload],
  );

  // Wrap customRequest so it receives the cropped File when crop produced one.
  const wrappedRequest: UploadCustomRequest = useCallback(
    async (params) => {
      const swap = replaceWith.current;
      replaceWith.current = null;
      const finalParams = swap ? { ...params, file: swap } : params;
      return customRequest(finalParams);
    },
    [customRequest],
  );

  const finishCropConfirm = useCallback(async () => {
    if (!pendingFile || !pendingSrc || !croppedArea) {
      cropResolver.current?.(false);
      cropResolver.current = null;
      return;
    }
    try {
      const blob = await cropImageToBlob(pendingSrc, croppedArea, pendingFile.type);
      const cropped = new File([blob], pendingFile.name, {
        type: pendingFile.type,
      });
      replaceWith.current = cropped;
      cropResolver.current?.(true);
    } catch {
      cropResolver.current?.(false);
    } finally {
      cropResolver.current = null;
      if (pendingSrc?.startsWith("blob:")) URL.revokeObjectURL(pendingSrc);
      setPendingFile(null);
      setPendingSrc(null);
    }
  }, [croppedArea, pendingFile, pendingSrc]);

  const finishCropCancel = useCallback(() => {
    cropResolver.current?.(false);
    cropResolver.current = null;
    if (pendingSrc?.startsWith("blob:")) URL.revokeObjectURL(pendingSrc);
    setPendingFile(null);
    setPendingSrc(null);
  }, [pendingSrc]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  return (
    <>
      <Upload
        {...rest}
        accept={accept}
        listType="picture-card"
        beforeUpload={handleBeforeUpload}
        customRequest={wrappedRequest}
      />

      {pendingSrc && (
        <div
          className="upload-cropper-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Crop image"
        >
          <div className="upload-cropper">
            <div className="upload-cropper-canvas">
              <Cropper
                image={pendingSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect ?? 1}
                cropShape={cropShape}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <Flex vertical gap="default" style={{ padding: "var(--spacing-3)" }}>
              <Flex align="center" gap="small">
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--muted-foreground)",
                    minWidth: 48,
                  }}
                >
                  {cropLabels.zoom}
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  aria-label={cropLabels.zoom}
                  style={{ flex: 1 }}
                />
              </Flex>
              <Space size="small">
                <Button type="button" onClick={finishCropConfirm}>
                  <Check size={14} />
                  {cropLabels.confirm}
                </Button>
                <Button type="button" variant="secondary" onClick={finishCropCancel}>
                  <X size={14} />
                  {cropLabels.cancel}
                </Button>
              </Space>
            </Flex>
          </div>
        </div>
      )}
    </>
  );
}

export type { UploadFile };
