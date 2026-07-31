import { describe, expect, expectTypeOf, it } from "vitest";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import * as dataDisplay from "../index";
import type {
  ServiceCatalogCtaProps,
  ServiceLauncherCardProps,
  ServiceLauncherCardSkeletonProps,
  ServiceLauncherStatusTone,
} from "../index";
import type { HeadingLevelProp, ToneProp } from "../../../props/vocabulary";

/**
 * gh#219 — TYPE contract of the public launcher surface. These assertions are the guard that the
 * public entrypoint keeps exporting the composite AND that its prop shapes stay in the controlled
 * vocabulary (tone, heading level, ReactNode slots) rather than drifting into bespoke unions.
 */
describe("ServiceLauncherCard public type contract (gh#219)", () => {
  it("exports the composite, its skeleton and its catalog companion from data-display", () => {
    expect(typeof dataDisplay.ServiceLauncherCard).toBe("object"); // forwardRef exotic component
    expect(typeof dataDisplay.ServiceLauncherCardSkeleton).toBe("function");
    expect(typeof dataDisplay.ServiceCatalogCta).toBe("object");
  });

  it("keeps the status tone a SUBSET of the shared ToneProp vocabulary", () => {
    expectTypeOf<ServiceLauncherStatusTone>().toMatchTypeOf<ToneProp>();
    // The three states the issue names must all be expressible.
    expectTypeOf<"success">().toMatchTypeOf<ServiceLauncherStatusTone>(); // live
    expectTypeOf<"warning">().toMatchTypeOf<ServiceLauncherStatusTone>(); // attention
    expectTypeOf<"destructive">().toMatchTypeOf<ServiceLauncherStatusTone>(); // unavailable
    expectTypeOf<"neutral">().toMatchTypeOf<ServiceLauncherStatusTone>();
  });

  it("types the content slots as ReactNode so consumers supply real localized content", () => {
    expectTypeOf<ServiceLauncherCardProps["title"]>().toMatchTypeOf<ReactNode>();
    expectTypeOf<ServiceLauncherCardProps["description"]>().toMatchTypeOf<ReactNode>();
    expectTypeOf<ServiceLauncherCardProps["metadata"]>().toMatchTypeOf<ReactNode>();
    expectTypeOf<ServiceLauncherCardProps["statusLabel"]>().toMatchTypeOf<ReactNode>();
    expectTypeOf<ServiceLauncherCardProps["disabledReason"]>().toMatchTypeOf<ReactNode>();
    expectTypeOf<ServiceLauncherCardProps["action"]>().toMatchTypeOf<ReactNode>();
    expectTypeOf<ServiceLauncherCardProps["icon"]>().toEqualTypeOf<LucideIcon>();
  });

  it("requires the real content the consumer owns and leaves the rest optional", () => {
    expectTypeOf<ServiceLauncherCardProps>().toMatchTypeOf<{
      icon: LucideIcon;
      title: ReactNode;
      action: ReactNode;
    }>();
    // Optional — the component must never require (nor infer) an access state.
    const minimal = {} as Omit<ServiceLauncherCardProps, "icon" | "title" | "action">;
    expectTypeOf(minimal.statusLabel).toMatchTypeOf<ReactNode | undefined>();
    expectTypeOf(minimal.disabledReason).toMatchTypeOf<ReactNode | undefined>();
  });

  it("exposes NO entitlement/URL/access prop that would let the component infer state", () => {
    type Has<K extends string> = K extends keyof ServiceLauncherCardProps ? true : false;
    expectTypeOf<Has<"href">>().toEqualTypeOf<false>();
    expectTypeOf<Has<"url">>().toEqualTypeOf<false>();
    expectTypeOf<Has<"entitlement">>().toEqualTypeOf<false>();
    expectTypeOf<Has<"permissions">>().toEqualTypeOf<false>();
    expectTypeOf<Has<"available">>().toEqualTypeOf<false>();
    expectTypeOf<Has<"subscribed">>().toEqualTypeOf<false>();
    // The one prop that IS present is the consumer's explicit reason string, not a derived flag.
    expectTypeOf<Has<"disabledReason">>().toEqualTypeOf<true>();
  });

  it("uses the shared heading-level vocabulary rather than a bespoke union", () => {
    expectTypeOf<ServiceLauncherCardProps["titleLevel"]>().toEqualTypeOf<
      HeadingLevelProp | undefined
    >();
  });

  it("extends the native div props (className, id, ref, data-*) on every surface", () => {
    expectTypeOf<ServiceLauncherCardProps["className"]>().toMatchTypeOf<string | undefined>();
    expectTypeOf<ServiceCatalogCtaProps["className"]>().toMatchTypeOf<string | undefined>();
    expectTypeOf<ServiceLauncherCardSkeletonProps["className"]>().toMatchTypeOf<
      string | undefined
    >();
    expectTypeOf<ServiceLauncherCardProps>().toMatchTypeOf<
      Omit<ComponentPropsWithoutRef<"div">, "title">
    >();
  });

  it("requires an accessible label on the skeleton so a loading tile is never mute", () => {
    expectTypeOf<ServiceLauncherCardSkeletonProps["label"]>().toEqualTypeOf<string>();
  });

  it("requires a real action on the catalog CTA — the tile is never a dead surface", () => {
    expectTypeOf<ServiceCatalogCtaProps>().toMatchTypeOf<{ title: ReactNode; action: ReactNode }>();
    expectTypeOf<ServiceCatalogCtaProps["icon"]>().toMatchTypeOf<LucideIcon | undefined>();
  });
});
