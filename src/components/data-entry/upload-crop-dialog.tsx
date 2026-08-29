import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../feedback/dialog";
import { Slider } from "./slider";

interface UploadCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onConfirm: (cropped: File) => void;
}

/** Simple 1:1 avatar crop — canvas export, no extra deps. */
export function UploadCropDialog({ open, onOpenChange, file, onConfirm }: UploadCropDialogProps) {
  const { t } = useTranslation();
  const [scale, setScale] = React.useState(1.2);
  const [src, setSrc] = React.useState<string | null>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear object URL state when the selected file is removed.
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || !file) return;

    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const side = Math.min(iw, ih) / scale;
    const sx = (iw - side) / 2;
    const sy = (ih - side) / 2;

    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) return;

    const cropped = new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
    onConfirm(cropped);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The cap stays a UTILITY reading the token, not a CSS class: `[data-slot="dialog-content"]`
          sets `max-width: none` in the same @layer at equal specificity, so only the
          utilities layer reliably wins (Tailwind v4 orders utilities after components). */}
      <DialogContent className="max-w-[var(--upload-crop-dialog-max-width)]">
        <DialogHeader>
          <DialogTitle>{t("dataEntry.upload.cropTitle")}</DialogTitle>
          <DialogDescription>{t("dataEntry.upload.cropDescription")}</DialogDescription>
        </DialogHeader>
        <div className="ui-stack-sm">
          {/* The round crop stage. Its size and radius are --upload-crop-* knobs so a service can
              keep the stage in proportion with its own --upload-avatar-size. */}
          <div
            className={cn(
              "bg-muted relative mx-auto size-[var(--upload-crop-preview-size)] overflow-hidden rounded-[var(--upload-crop-preview-radius)] border",
              "flex items-center justify-center",
            )}
          >
            {src ? (
              <img
                ref={imgRef}
                src={src}
                alt=""
                className="size-full object-cover transition-transform duration-[var(--duration-fast)]"
                // DYNAMIC — the live zoom value, so it stays inline (upload-crop-dialog.test.tsx
                // reads `preview.style.transform` to assert the slider moves it).
                style={{ transform: `scale(${scale})` }}
              />
            ) : null}
          </div>
          <div className="ui-stack-xs px-[var(--upload-crop-zoom-space-inline)]">
            <span className="text-muted-foreground text-xs">{t("dataEntry.upload.cropZoom")}</span>
            <Slider
              min={1}
              max={2.5}
              step={0.05}
              value={[scale]}
              onValueChange={(v) => setScale(v[0] ?? 1)}
              aria-label={t("dataEntry.upload.cropZoom")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={() => void handleConfirm()}>{t("dataEntry.upload.cropConfirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
