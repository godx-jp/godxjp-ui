import * as React from "react";
import { Card, CardContent } from "@godxjp/ui/data-display";
import { Flex } from "@godxjp/ui/layout";

import { HighlightedCode } from "./highlight";

export const DEVICE_PRESETS = [
  {
    id: "responsive",
    label: "Responsive",
    width: null as number | null,
    height: null as number | null,
  },
  { id: "iphone-se", label: "iPhone SE", width: 375, height: 667 },
  { id: "iphone-14", label: "iPhone 14 Pro", width: 393, height: 852 },
  { id: "ipad", label: "iPad Air", width: 820, height: 1180 },
  { id: "desktop", label: "Desktop", width: 1280, height: 800 },
] as const;

export type DevicePresetId = (typeof DEVICE_PRESETS)[number]["id"];

export type ZoomMode = "fit" | number;

const DEFAULT_PRESET: DevicePresetId = "responsive";
const DEFAULT_ZOOM: ZoomMode = 100;

function presetById(id: DevicePresetId) {
  return DEVICE_PRESETS.find((p) => p.id === id) ?? DEVICE_PRESETS[0]!;
}

function clampDim(n: number, min = 200, max = 3840): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function clampZoom(n: number): number {
  return Math.min(300, Math.max(10, Math.round(n)));
}

const RESPONSIVE_CANVAS_INSET = 16; // horizontal inset total (matches canvas padding 8px × 2)
const RESPONSIVE_FULLSCREEN_HEIGHT = 800;

function computeAutoFitScale(
  logicalW: number,
  logicalH: number,
  areaW: number,
  areaH: number,
  widthOnly: boolean,
): number {
  const pad = RESPONSIVE_CANVAS_INSET;
  const maxW = Math.max(120, areaW - pad);
  const scaleW = maxW / logicalW;
  if (widthOnly) return Math.min(scaleW, 1);
  const maxH = Math.max(120, areaH - pad);
  return Math.min(scaleW, maxH / logicalH, 1);
}

/** Fit area = viewport minus demo-block toolbar, footer, and optional code panel. */
function getFitAreaBounds(
  block: HTMLElement | null,
  canvas: HTMLElement | null,
  options: { showFooter: boolean; codeOpen: boolean },
): { width: number; height: number } {
  if (!block || !canvas || typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  const blockRect = block.getBoundingClientRect();
  const toolbar = block.querySelector(".demo-block-toolbar");
  const footer = block.querySelector(".demo-block-footer");
  const codePanel = block.querySelector(".demo-block-code");

  const toolbarH = toolbar?.getBoundingClientRect().height ?? 0;
  const footerH = options.showFooter ? (footer?.getBoundingClientRect().height ?? 0) : 0;
  const codeH =
    options.showFooter && options.codeOpen ? (codePanel?.getBoundingClientRect().height ?? 0) : 0;

  const canvasStyle = getComputedStyle(canvas);
  const padY = parseFloat(canvasStyle.paddingTop) + parseFloat(canvasStyle.paddingBottom);
  const padX = parseFloat(canvasStyle.paddingLeft) + parseFloat(canvasStyle.paddingRight);

  const regionTop = blockRect.top + toolbarH;
  const regionBottom = window.innerHeight - footerH - codeH;
  const height = Math.max(120, regionBottom - regionTop - padY);
  const width = Math.max(120, canvas.clientWidth - padX);

  return { width, height };
}

function initialDims(
  presetId: DevicePresetId,
  layout: "fullscreen" | "padded",
  viewport?: { width?: number; height?: number },
): { width: number; height: number } {
  const preset = presetById(presetId);
  if (preset.width != null && preset.height != null) {
    return { width: preset.width, height: preset.height };
  }
  return {
    width: viewport?.width ?? 960,
    height: viewport?.height ?? (layout === "fullscreen" ? 800 : 360),
  };
}

// `import.meta.env.BASE_URL` is "/" in dev and "/<repo>/" on a GitHub Pages project page —
// include it so the standalone tabs resolve under the deployed base, not the bare origin.
const PREVIEW_BASE = import.meta.env.BASE_URL;

export function openStoryInNewTab(storyId: string) {
  window.open(
    `${window.location.origin}${PREVIEW_BASE}isolate/${encodeURIComponent(storyId)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export type DemoBlockInitialView = {
  presetId?: DevicePresetId;
  zoom?: ZoomMode;
  width?: number;
  height?: number;
};

export function openStoryFrameInNewTab(storyId: string, view?: DemoBlockInitialView) {
  const params = new URLSearchParams();
  if (view?.presetId) params.set("preset", view.presetId);
  if (view?.zoom != null) params.set("zoom", view.zoom === "fit" ? "fit" : String(view.zoom));
  if (view?.width != null) params.set("w", String(view.width));
  if (view?.height != null) params.set("h", String(view.height));
  const qs = params.toString();
  const url = `${window.location.origin}${PREVIEW_BASE}frame/${encodeURIComponent(storyId)}${qs ? `?${qs}` : ""}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function resolveInitialState(
  layout: "fullscreen" | "padded",
  storyViewport: { width?: number; height?: number },
  initialView?: DemoBlockInitialView,
) {
  const presetId = initialView?.presetId ?? DEFAULT_PRESET;
  const dims = initialDims(presetId, layout, {
    width: initialView?.width ?? storyViewport.width,
    height: initialView?.height ?? storyViewport.height,
  });
  const zoom = initialView?.zoom ?? DEFAULT_ZOOM;
  return { presetId, dims, zoom };
}

export function StoryDemoBlock({
  storyId,
  source,
  layout,
  viewportWidth,
  viewportHeight,
  initialView,
  showFooter = true,
  loading,
  error,
  children,
}: {
  storyId: string;
  source: string;
  layout: "fullscreen" | "padded";
  viewportWidth?: number;
  viewportHeight?: number;
  initialView?: DemoBlockInitialView;
  showFooter?: boolean;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  const storyViewport = React.useMemo(
    () => ({ width: viewportWidth, height: viewportHeight }),
    [viewportHeight, viewportWidth],
  );

  const [presetId, setPresetId] = React.useState<DevicePresetId>(
    () => resolveInitialState(layout, storyViewport, initialView).presetId,
  );
  const [dimW, setDimW] = React.useState(
    () => resolveInitialState(layout, storyViewport, initialView).dims.width,
  );
  const [dimH, setDimH] = React.useState(
    () => resolveInitialState(layout, storyViewport, initialView).dims.height,
  );
  const [dimDraftW, setDimDraftW] = React.useState(() =>
    String(resolveInitialState(layout, storyViewport, initialView).dims.width),
  );
  const [dimDraftH, setDimDraftH] = React.useState(() =>
    String(resolveInitialState(layout, storyViewport, initialView).dims.height),
  );
  const [zoomMode, setZoomMode] = React.useState<ZoomMode>(
    () => resolveInitialState(layout, storyViewport, initialView).zoom,
  );
  const [zoomDraft, setZoomDraft] = React.useState(() => {
    const zoom = resolveInitialState(layout, storyViewport, initialView).zoom;
    return zoom === "fit" ? "fit" : String(zoom);
  });
  const [codeOpen, setCodeOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const blockRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = React.useState({ w: 0, h: 0 });
  const [contentMeasured, setContentMeasured] = React.useState(false);
  const [fitTick, setFitTick] = React.useState(0);

  const preset = presetById(presetId);
  const isResponsive = preset.width === null || preset.height === null;
  const measureContentHeight =
    isResponsive && layout === "padded" && viewportHeight == null && !loading && !error;
  const frameHeightAuto = measureContentHeight && !contentMeasured;

  React.useEffect(() => {
    setPresetId(DEFAULT_PRESET);
    setZoomMode(DEFAULT_ZOOM);
    setZoomDraft(String(DEFAULT_ZOOM));
    setContentMeasured(false);
    const dims = initialDims(DEFAULT_PRESET, layout, storyViewport);
    setDimW(dims.width);
    setDimH(dims.height);
    setDimDraftW(String(dims.width));
    setDimDraftH(String(dims.height));
  }, [storyId, layout, storyViewport]);

  React.useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;

    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) setCanvasSize({ w: box.width, h: box.height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const bump = () => setFitTick((t) => t + 1);
    window.addEventListener("resize", bump);
    const node = blockRef.current;
    if (!node) return () => window.removeEventListener("resize", bump);
    const ro = new ResizeObserver(bump);
    ro.observe(node);
    return () => {
      window.removeEventListener("resize", bump);
      ro.disconnect();
    };
  }, []);

  // Responsive width follows canvas; height is per-story (frontmatter) or content measure.
  React.useEffect(() => {
    if (!isResponsive || canvasSize.w <= 0) return;
    const w = viewportWidth ?? clampDim(canvasSize.w - RESPONSIVE_CANVAS_INSET, 280, 3840);
    setDimW(w);
    setDimDraftW(String(w));
  }, [canvasSize.w, isResponsive, viewportWidth]);

  React.useEffect(() => {
    if (!isResponsive || viewportHeight == null) return;
    setDimH(viewportHeight);
    setDimDraftH(String(viewportHeight));
  }, [isResponsive, viewportHeight]);

  React.useEffect(() => {
    if (!isResponsive || viewportHeight != null) return;
    if (layout === "fullscreen") {
      setDimH(RESPONSIVE_FULLSCREEN_HEIGHT);
      setDimDraftH(String(RESPONSIVE_FULLSCREEN_HEIGHT));
    }
  }, [isResponsive, layout, viewportHeight]);

  React.useEffect(() => {
    if (!measureContentHeight) return;
    const node = frameRef.current;
    if (!node) return;

    const sync = () => {
      const h = Math.ceil(node.scrollHeight);
      if (h <= 0) return;
      const next = clampDim(h, 120, 3840);
      setDimH(next);
      setDimDraftH(String(next));
      setContentMeasured(true);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(node);
    return () => ro.disconnect();
  }, [measureContentHeight, children, storyId]);

  const applyPreset = (next: DevicePresetId) => {
    const nextPreset = presetById(next);
    setPresetId(next);
    setZoomMode(DEFAULT_ZOOM);
    setZoomDraft(String(DEFAULT_ZOOM));
    if (nextPreset.width != null && nextPreset.height != null) {
      setDimW(nextPreset.width);
      setDimH(nextPreset.height);
      setDimDraftW(String(nextPreset.width));
      setDimDraftH(String(nextPreset.height));
    } else {
      const dims = initialDims(next, layout, storyViewport);
      setDimW(dims.width);
      setDimH(dims.height);
      setDimDraftW(String(dims.width));
      setDimDraftH(String(dims.height));
    }
  };

  const commitDimDraft = React.useCallback(
    (axis: "w" | "h") => {
      const raw = axis === "w" ? dimDraftW.trim() : dimDraftH.trim();
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        setDimDraftW(String(dimW));
        setDimDraftH(String(dimH));
        return;
      }
      const clamped = clampDim(n);
      if (axis === "w") {
        setDimW(clamped);
        setDimDraftW(String(clamped));
      } else {
        setDimH(clamped);
        setDimDraftH(String(clamped));
      }
    },
    [dimDraftH, dimDraftW, dimH, dimW],
  );

  const autoFitScale = React.useMemo(() => {
    void fitTick;
    const bounds = getFitAreaBounds(blockRef.current, canvasRef.current, { showFooter, codeOpen });
    if (bounds.width <= 0) return 1;
    const widthOnly = isResponsive || measureContentHeight;
    return computeAutoFitScale(dimW, dimH, bounds.width, bounds.height, widthOnly);
  }, [fitTick, codeOpen, showFooter, dimH, dimW, isResponsive, measureContentHeight, canvasSize.w]);

  const effectiveScale = zoomMode === "fit" ? autoFitScale : clampZoom(zoomMode) / 100;

  const viewportW = Math.round(dimW * effectiveScale);
  const viewportH = Math.round(dimH * effectiveScale);

  const applyZoomDraft = React.useCallback(() => {
    const raw = zoomDraft.trim().toLowerCase();
    if (raw === "fit" || raw === "") {
      setZoomMode("fit");
      setZoomDraft("fit");
      return;
    }
    const n = Number(raw.replace(/%$/, ""));
    if (!Number.isFinite(n)) return;
    const clamped = clampZoom(n);
    setZoomMode(clamped);
    setZoomDraft(String(clamped));
  }, [zoomDraft]);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [source]);

  const zoomPercentLabel =
    zoomMode === "fit" ? `${Math.round(autoFitScale * 100)}%` : `${zoomMode}%`;

  return (
    <Card className="demo-block" ref={blockRef}>
      <CardContent>
        <Flex direction="col" gap="lg">
          <header className="demo-block-toolbar">
            <label className="demo-block-field">
              <span className="demo-block-field-label">Dimensions</span>
              <select
                className="demo-block-select"
                value={presetId}
                onChange={(e) => applyPreset(e.currentTarget.value as DevicePresetId)}
                aria-label="Device preset"
              >
                {DEVICE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="demo-block-dims" aria-label="Viewport size">
              <input
                className="demo-block-dim-input demo-block-dim-input-wide"
                type="text"
                inputMode="numeric"
                readOnly={isResponsive}
                value={dimDraftW}
                aria-label="Width"
                onChange={(e) => setDimDraftW(e.currentTarget.value)}
                onBlur={() => commitDimDraft("w")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitDimDraft("w");
                    e.currentTarget.blur();
                  }
                }}
              />
              <span className="demo-block-dim-sep">×</span>
              <input
                className="demo-block-dim-input demo-block-dim-input-wide"
                type="text"
                inputMode="numeric"
                readOnly={isResponsive}
                value={dimDraftH}
                aria-label="Height"
                onChange={(e) => setDimDraftH(e.currentTarget.value)}
                onBlur={() => commitDimDraft("h")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitDimDraft("h");
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
            <label className="demo-block-field demo-block-field-zoom">
              <span className="demo-block-field-label">Zoom</span>
              <input
                className="demo-block-dim-input demo-block-zoom-input"
                type="text"
                inputMode="decimal"
                value={zoomDraft}
                aria-label="Zoom percentage or fit"
                title="Enter 10–300 or fit"
                onChange={(e) => setZoomDraft(e.currentTarget.value)}
                onBlur={applyZoomDraft}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyZoomDraft();
                    e.currentTarget.blur();
                  }
                }}
              />
              <span className="demo-block-zoom-suffix">%</span>
              <button
                type="button"
                className="demo-block-zoom-preset"
                data-active={zoomMode === 100 ? "true" : undefined}
                onClick={() => {
                  setZoomMode(100);
                  setZoomDraft("100");
                }}
              >
                100%
              </button>
              <button
                type="button"
                className="demo-block-zoom-preset"
                data-active={zoomMode === "fit" ? "true" : undefined}
                onClick={() => {
                  setZoomMode("fit");
                  setZoomDraft("fit");
                }}
              >
                Fit
              </button>
            </label>
            <span className="demo-block-meta" title="Effective scale">
              {zoomPercentLabel}
            </span>
          </header>

          <div
            className="demo-block-canvas"
            ref={canvasRef}
            data-mode={layout === "fullscreen" ? "page" : "component"}
            data-responsive={isResponsive ? "true" : undefined}
          >
            <div
              className="demo-block-viewport"
              style={{
                width: `${viewportW}px`,
                height: `${viewportH}px`,
              }}
            >
              <div
                ref={frameRef}
                className="demo-block-frame"
                data-layout={layout}
                data-fill={layout === "fullscreen" ? "true" : undefined}
                data-height-mode={frameHeightAuto ? "auto" : undefined}
                style={{
                  width: `${dimW}px`,
                  height: frameHeightAuto ? "auto" : `${dimH}px`,
                  transform: effectiveScale === 1 ? undefined : `scale(${effectiveScale})`,
                  transformOrigin: "top left",
                }}
              >
                {loading ? <div className="preview-loading">Loading…</div> : null}
                {error ? (
                  <div className="preview-error">
                    <strong>Failed to load demo</strong>
                    <pre>{error}</pre>
                  </div>
                ) : null}
                {!loading && !error ? children : null}
              </div>
            </div>
          </div>

          {showFooter ? (
            <footer className="demo-block-footer">
              <Flex direction="row" wrap align="center" gap="sm">
                <button
                  type="button"
                  className="demo-block-footer-btn"
                  data-active={codeOpen ? "true" : undefined}
                  onClick={() => setCodeOpen((v) => !v)}
                  aria-expanded={codeOpen}
                >
                  View code
                </button>
                <button
                  type="button"
                  className="demo-block-footer-btn"
                  onClick={() => openStoryInNewTab(storyId)}
                >
                  Open in new tab
                </button>
                <button
                  type="button"
                  className="demo-block-footer-btn"
                  onClick={() =>
                    openStoryFrameInNewTab(storyId, {
                      presetId,
                      zoom: zoomMode,
                      width: dimW,
                      height: dimH,
                    })
                  }
                >
                  Open with viewport
                </button>
                {codeOpen ? (
                  <button
                    type="button"
                    className="demo-block-footer-btn demo-block-footer-copy"
                    onClick={copy}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                ) : null}
              </Flex>
            </footer>
          ) : null}

          {showFooter && codeOpen ? (
            <div className="demo-block-code">
              <pre className="demo-block-code-pre">
                <HighlightedCode source={source} />
              </pre>
            </div>
          ) : null}
        </Flex>
      </CardContent>
    </Card>
  );
}
