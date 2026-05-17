import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "../general/Button";
import { cn } from "../cn";

/**
 * Tour — multi-step product walkthrough.
 *
 * Overlays the viewport, highlights a target with a popover callout,
 * advances step-by-step. v1 uses a single semi-transparent mask
 * (no true cutout) and positions the callout near the target's
 * bounding rect (or page-centre when `placement="center"`).
 *
 * Vocabulary (cardinal rule 23 §B):
 *   - `open` / `defaultOpen` / `onOpenChange` — Radix-style visibility.
 *   - `current` / `defaultCurrent` / `onCurrentChange` — active step.
 *   - `placement` — positional anchor of the callout.
 *
 * @example
 *   <Tour
 *     defaultOpen
 *     steps={[
 *       { target: "#new-btn", title: "新規作成", description: "…" },
 *       { target: "#filter",  title: "絞り込み" },
 *     ]}
 *   />
 */

export type TourPlacement = "top" | "right" | "bottom" | "left" | "center";

export interface TourStep {
  /** CSS selector OR ref to highlight. Omit / `null` → centred. */
  target?: string | RefObject<HTMLElement | null>;
  title: ReactNode;
  description?: ReactNode;
  /** Callout placement relative to the target. Default "bottom". */
  placement?: TourPlacement;
}

export interface TourLabels {
  prev?: string;
  next?: string;
  finish?: string;
  skip?: string;
}

const DEFAULT_LABELS: Required<TourLabels> = {
  prev: "Back",
  next: "Next",
  finish: "Finish",
  skip: "Skip",
};

export interface TourProps {
  steps: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controlled current step (0-based). */
  current?: number;
  defaultCurrent?: number;
  onCurrentChange?: (step: number) => void;
  /** Called when the user clicks Finish on the last step. */
  onFinish?: () => void;
  /** Called when the user dismisses (Skip / Esc). */
  onClose?: () => void;
  /** Override button strings. */
  labels?: TourLabels;
  className?: string;
}

interface CalloutPosition {
  top: number;
  left: number;
}

const CALLOUT_GAP = 12;
const CALLOUT_WIDTH = 320;
const CALLOUT_HEIGHT_ESTIMATE = 160;

function resolveTarget(
  target: TourStep["target"],
): HTMLElement | null {
  if (!target) return null;
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target);
  }
  return target.current ?? null;
}

function computeCalloutPos(
  rect: DOMRect,
  placement: TourPlacement,
): CalloutPosition {
  const viewportW =
    typeof window !== "undefined" ? window.innerWidth : 1280;
  const viewportH =
    typeof window !== "undefined" ? window.innerHeight : 800;

  let top = 0;
  let left = 0;
  switch (placement) {
    case "top":
      top = rect.top - CALLOUT_HEIGHT_ESTIMATE - CALLOUT_GAP;
      left = rect.left + rect.width / 2 - CALLOUT_WIDTH / 2;
      break;
    case "right":
      top = rect.top + rect.height / 2 - CALLOUT_HEIGHT_ESTIMATE / 2;
      left = rect.right + CALLOUT_GAP;
      break;
    case "left":
      top = rect.top + rect.height / 2 - CALLOUT_HEIGHT_ESTIMATE / 2;
      left = rect.left - CALLOUT_WIDTH - CALLOUT_GAP;
      break;
    case "bottom":
    default:
      top = rect.bottom + CALLOUT_GAP;
      left = rect.left + rect.width / 2 - CALLOUT_WIDTH / 2;
      break;
  }

  // Clamp inside the viewport.
  top = Math.max(8, Math.min(viewportH - CALLOUT_HEIGHT_ESTIMATE - 8, top));
  left = Math.max(8, Math.min(viewportW - CALLOUT_WIDTH - 8, left));
  return { top, left };
}

export function Tour({
  steps,
  open,
  defaultOpen = false,
  onOpenChange,
  current,
  defaultCurrent = 0,
  onCurrentChange,
  onFinish,
  onClose,
  labels,
  className,
}: TourProps) {
  const isOpenControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const isOpen = isOpenControlled ? !!open : internalOpen;

  const isStepControlled = current !== undefined;
  const [internalStep, setInternalStep] = useState<number>(defaultCurrent);
  const stepIndex = isStepControlled
    ? Math.max(0, Math.min(steps.length - 1, current ?? 0))
    : Math.max(0, Math.min(steps.length - 1, internalStep));

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const setStep = useCallback(
    (next: number) => {
      if (!isStepControlled) setInternalStep(next);
      onCurrentChange?.(next);
    },
    [isStepControlled, onCurrentChange],
  );

  const resolvedLabels = useMemo<Required<TourLabels>>(
    () => ({ ...DEFAULT_LABELS, ...(labels ?? {}) }),
    [labels],
  );

  const step = steps[stepIndex];
  const placement: TourPlacement = step?.placement ?? "bottom";
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const [pos, setPos] = useState<CalloutPosition | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const recompute = useCallback(() => {
    if (!isOpen || !step) {
      setPos(null);
      setTargetRect(null);
      return;
    }
    if (placement === "center" || step.target == null) {
      setPos(null);
      setTargetRect(null);
      return;
    }
    const el = resolveTarget(step.target);
    if (!el) {
      setPos(null);
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    setPos(computeCalloutPos(rect, placement));
  }, [isOpen, placement, step]);

  useEffect(() => {
    if (!isOpen) return;
    recompute();
    const onScroll = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(recompute);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, recompute]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [setOpen, onClose]);

  const handleNext = useCallback(() => {
    if (isLast) {
      setOpen(false);
      onFinish?.();
      return;
    }
    setStep(stepIndex + 1);
  }, [isLast, stepIndex, setStep, setOpen, onFinish]);

  const handlePrev = useCallback(() => {
    if (isFirst) return;
    setStep(stepIndex - 1);
  }, [isFirst, stepIndex, setStep]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  if (!isOpen || !step || typeof document === "undefined") return null;

  const calloutStyle =
    pos !== null
      ? { top: pos.top, left: pos.left }
      : ({} as Record<string, never>);

  const highlightStyle =
    targetRect !== null
      ? {
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }
      : null;

  return createPortal(
    <div
      className={cn("tour-overlay", className)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-callout-title"
    >
      <div className="tour-mask" aria-hidden onClick={handleClose} />
      {highlightStyle !== null && (
        <div
          className="tour-highlight"
          aria-hidden
          style={highlightStyle}
        />
      )}
      <div
        className={cn(
          "tour-callout",
          pos === null && "tour-callout-center",
        )}
        style={calloutStyle}
        data-placement={placement}
      >
        <div className="tour-callout-title" id="tour-callout-title">
          {step.title}
        </div>
        {step.description !== undefined && (
          <div className="tour-callout-desc">{step.description}</div>
        )}
        <div className="tour-callout-footer">
          <span className="tour-callout-progress">
            {stepIndex + 1} / {steps.length}
          </span>
          <div className="tour-callout-actions">
            <Button variant="ghost" size="small" onClick={handleClose}>
              {resolvedLabels.skip}
            </Button>
            {!isFirst && (
              <Button variant="secondary" size="small" onClick={handlePrev}>
                {resolvedLabels.prev}
              </Button>
            )}
            <Button variant="primary" size="small" onClick={handleNext}>
              {isLast ? resolvedLabels.finish : resolvedLabels.next}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
