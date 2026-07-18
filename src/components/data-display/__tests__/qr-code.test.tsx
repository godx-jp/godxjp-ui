import * as React from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import { QrCode } from "../qr-code";

const TOTP_URI =
  "otpauth://totp/GoDX:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GoDX&digits=6&period=30";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QrCode", () => {
  it("renders a locally encoded, purpose-labelled SVG without exposing the value as text", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<QrCode value={TOTP_URI} label="Two-factor setup code" />);

    const image = screen.getByRole("img", { name: "Two-factor setup code" });
    expect(image).toHaveAttribute("data-slot", "qr-code");
    expect(image).toHaveAttribute("data-size", "md");
    expect(image.querySelector("title")).toHaveTextContent("Two-factor setup code");
    expect(image.querySelectorAll("path").length).toBeGreaterThan(0);
    expect(container.innerHTML).not.toContain(TOTP_URI);
    expect(container.querySelector("img")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("keeps a four-module quiet zone around every encoded module", () => {
    render(<QrCode value={TOTP_URI} label="Enrollment QR code" />);

    const image = screen.getByRole("img", { name: "Enrollment QR code" });
    const viewBoxSize = Number(image.getAttribute("viewBox")?.split(" ").at(-1));
    const foregroundPath = image.querySelector("path:last-of-type")?.getAttribute("d") ?? "";

    expect(viewBoxSize).toBeGreaterThan(8);
    expect(foregroundPath).toMatch(/M4[ ,]4/);
    expect(foregroundPath).not.toContain("M0,0");
  });

  it.each(["xs", "sm", "md", "lg"] as const)("exposes the %s size tier", (size) => {
    render(<QrCode value="https://godx.jp" label={`${size} QR code`} size={size} />);
    expect(screen.getByRole("img", { name: `${size} QR code` })).toHaveAttribute("data-size", size);
  });

  it("re-encodes when the value changes and forwards ref and SVG attributes", () => {
    const ref = React.createRef<SVGSVGElement>();
    const { rerender } = render(
      <QrCode
        ref={ref}
        id="enrollment-code"
        className="consumer-class"
        value="first"
        label="Enrollment code"
      />,
    );
    const firstPath = ref.current?.querySelector("path:last-of-type")?.getAttribute("d");

    rerender(
      <QrCode
        ref={ref}
        id="enrollment-code"
        className="consumer-class"
        value="second"
        label="Enrollment code"
      />,
    );

    expect(ref.current).toHaveAttribute("id", "enrollment-code");
    expect(ref.current).toHaveClass("ui-qr-code", "consumer-class");
    expect(ref.current?.querySelector("path:last-of-type")?.getAttribute("d")).not.toBe(firstPath);
  });

  it("renders during SSR without browser globals or network work", () => {
    const html = renderToString(<QrCode value={TOTP_URI} label="Two-factor setup code" />);
    expect(html).toContain('data-slot="qr-code"');
    expect(html).not.toContain(TOTP_URI);
  });
});
