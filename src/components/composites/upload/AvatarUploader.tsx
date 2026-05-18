// <AvatarUploader> — single image + required round crop, the
// pre-configured avatar variant of the Upload family. Stages:
// idle → cropping → uploading → success / error.
//
// Surface preserved (callsites depend on it):
//   onUpload({ blob, file, onProgress, signal })  — service transport
//   validate(file)                                 — pre-check hook
//   allowedTypes / maxSize / aspect / cropShape    — gating + crop
//   labels                                         — i18n
//   errorMapper(err)                               — friendly copy
//   onSuccess() / onCancel()                       — lifecycle
//   trigger                                        — slot
//
// Internally shares MIME + size validation and the crop helper with
// the rest of the Upload family.

import { useCallback, useRef, useState, type ReactNode } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Camera, RotateCw, Upload as UploadIcon, X } from "lucide-react";
import { Button } from "../../general/Button";
import { Flex, Space } from "../../layout";
import { validateFile } from "./shared/validate";
import { DEFAULT_UPLOAD_LABELS } from "./shared/types";

export interface AvatarUploaderLabels {
  chooseImage: string;
  upload: string;
  cancel: string;
  cancelUpload: string;
  tryAgain: string;
  uploadSuccess: string;
  change: string;
  rejectedType: string;
  rejectedTooLarge: string;
}

const DEFAULT_LABELS: AvatarUploaderLabels = {
  chooseImage: "Choose image",
  upload: "Upload",
  cancel: "Cancel",
  cancelUpload: "Cancel upload",
  tryAgain: "Try again",
  uploadSuccess: "Avatar updated successfully.",
  change: "Change",
  rejectedType: "File must be JPEG, PNG, or WebP",
  rejectedTooLarge: "File must be smaller than {{mb}} MB",
};

const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MiB

export interface AvatarUploadCallbackParams {
  /** Selected source file (pre-crop). */
  file: File;
  /** Cropped image blob ready to ship. */
  blob: Blob;
  /** 0..100 progress callback. */
  onProgress?: (pct: number) => void;
  /** AbortController signal — fires when user cancels. */
  signal: AbortSignal;
}

export interface AvatarUploaderProps {
  /** Required — service provides the actual upload + persistence. */
  onUpload: (params: AvatarUploadCallbackParams) => Promise<void>;
  /** Override file validation. Return `null` for OK, string for error message. */
  validate?: (file: File) => string | null;
  /** Allowed MIME types (default JPEG/PNG/WebP). */
  allowedTypes?: string[];
  /** Max file size in bytes (default 5 MiB). */
  maxSize?: number;
  /** Crop aspect ratio (default 1, square). */
  aspect?: number;
  /** Crop shape — "round" (default, fits avatar) or "rect". */
  cropShape?: "round" | "rect";
  /** Localised button + error strings. */
  labels?: Partial<AvatarUploaderLabels>;
  /** Map a thrown error to a user-friendly message. */
  errorMapper?: (err: unknown) => string;
  /** Hook fired on success after `onUpload` resolves. */
  onSuccess?: () => void;
  /** Hook fired when user picks cancel. */
  onCancel?: () => void;
  /** Render a custom "choose image" trigger instead of the default Button. */
  trigger?: ReactNode;
}

type Phase = "idle" | "cropping" | "uploading" | "success" | "error";

async function cropImage(imageSrc: string, area: Area): Promise<Blob> {
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
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      "image/png",
      0.95,
    );
  });
}

export function AvatarUploader({
  onUpload,
  validate,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxSize = DEFAULT_MAX_SIZE,
  aspect = 1,
  cropShape = "round",
  labels: labelOverrides,
  errorMapper,
  onSuccess,
  onCancel,
  trigger,
}: AvatarUploaderProps) {
  const labels = { ...DEFAULT_LABELS, ...(labelOverrides ?? {}) };
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setSelectedFile(null);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setProgress(0);
    setErrorMsg("");
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    onCancel?.();
    reset();
  }, [onCancel, reset]);

  const runDefaultValidation = useCallback(
    (file: File): string | null => {
      const result = validateFile(file, {
        accept: allowedTypes.join(","),
        maxSize,
        labels: {
          ...DEFAULT_UPLOAD_LABELS,
          rejectedType: labels.rejectedType,
          rejectedTooLarge: labels.rejectedTooLarge,
        },
      });
      return result.ok ? null : (result.error ?? null);
    },
    [allowedTypes, maxSize, labels.rejectedType, labels.rejectedTooLarge],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      const validationError = validate ? validate(file) : runDefaultValidation(file);
      if (validationError) {
        setErrorMsg(validationError);
        setPhase("error");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setPhase("cropping");
      };
      reader.readAsDataURL(file);
    },
    [validate, runDefaultValidation],
  );

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !imageSrc || !croppedArea) return;
    setPhase("uploading");
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const blob = await cropImage(imageSrc, croppedArea);
      await onUpload({
        file: selectedFile,
        blob,
        onProgress: setProgress,
        signal: controller.signal,
      });
      setPhase("success");
      onSuccess?.();
    } catch (err) {
      if (controller.signal.aborted) return;
      const msg = errorMapper
        ? errorMapper(err)
        : err instanceof Error
          ? err.message
          : "Upload failed.";
      setErrorMsg(msg);
      setPhase("error");
    }
  }, [selectedFile, imageSrc, croppedArea, onUpload, onSuccess, errorMapper]);

  return (
    <Flex vertical gap="default">
      <input
        ref={inputRef}
        type="file"
        accept={allowedTypes.join(",")}
        style={{ display: "none" }}
        onChange={handleFileSelect}
        aria-label={labels.chooseImage}
      />

      {phase === "idle" &&
        (trigger ? (
          <span onClick={() => inputRef.current?.click()}>{trigger}</span>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
          >
            <Camera size={16} />
            {labels.chooseImage}
          </Button>
        ))}

      {phase === "cropping" && imageSrc && (
        <Flex vertical gap="default">
          <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
          />
          <Space size="small">
            <Button type="button" onClick={handleUpload}>
              <UploadIcon size={16} />
              {labels.upload}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              <X size={16} />
              {labels.cancel}
            </Button>
          </Space>
        </Flex>
      )}

      {phase === "uploading" && (
        <Flex vertical gap="small">
          <Flex align="center" gap="default">
            <div
              style={{
                height: "8px",
                flex: 1,
                borderRadius: "var(--radius-full)",
                background: "var(--muted)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "var(--primary)",
                  borderRadius: "var(--radius-full)",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
              {progress}%
            </span>
          </Flex>
          <Button type="button" variant="secondary" size="small" onClick={handleCancel}>
            <X size={16} />
            {labels.cancelUpload}
          </Button>
        </Flex>
      )}

      {phase === "success" && (
        <Flex align="center" gap="default">
          <span style={{ fontSize: "var(--text-sm)", color: "var(--success)" }}>
            {labels.uploadSuccess}
          </span>
          <Button type="button" variant="ghost" size="small" onClick={reset}>
            <RotateCw size={16} />
            {labels.change}
          </Button>
        </Flex>
      )}

      {phase === "error" && (
        <Flex vertical gap="small">
          <span style={{ fontSize: "var(--text-sm)", color: "var(--destructive)" }} role="alert">
            {errorMsg}
          </span>
          <Space size="small">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => inputRef.current?.click()}
            >
              <RotateCw size={16} />
              {labels.tryAgain}
            </Button>
            <Button type="button" variant="ghost" size="small" onClick={reset}>
              {labels.cancel}
            </Button>
          </Space>
        </Flex>
      )}
    </Flex>
  );
}
