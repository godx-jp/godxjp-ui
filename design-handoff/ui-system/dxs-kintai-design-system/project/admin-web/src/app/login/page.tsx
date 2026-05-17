"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  const handleSsoLogin = () => {
    const consoleUrl = process.env.NEXT_PUBLIC_CONSOLE_URL;
    const serviceSlug = process.env.NEXT_PUBLIC_SSO_SERVICE_SLUG;

    // Pass redirect param through callback so user returns to original page
    const callbackUrl = new URL("/login/callback", window.location.origin);
    if (redirect) callbackUrl.searchParams.set("redirect", redirect);

    window.location.href = `${consoleUrl}/sso/authorize?service_slug=${serviceSlug}&redirect_uri=${encodeURIComponent(callbackUrl.toString())}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">DXS Product</CardTitle>
          <CardDescription>Sign in with your organization account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSsoLogin} className="w-full" size="lg">
            Sign in with SSO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
