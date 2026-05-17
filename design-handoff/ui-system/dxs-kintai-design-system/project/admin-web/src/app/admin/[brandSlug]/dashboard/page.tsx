"use client";

/**
 * Legacy dashboard landing — plan-004 T3.4 merges the plan-001 blank
 * dashboard with plan-003's time dashboard. The canonical brand-scoped home
 * is now `/admin/{slug}/time`; this page redirects there so bookmarks and
 * the old nav target keep working.
 *
 * Top-level `/admin` (HR cross-brand dashboard) lands in Phase 5 and will
 * become the ultimate admin home — but until then the brand time dashboard
 * is the canonical entry.
 */

import { useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

export default function AdminDashboardRedirectPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/${brandSlug}/time`);
  }, [brandSlug, router]);

  return null;
}
