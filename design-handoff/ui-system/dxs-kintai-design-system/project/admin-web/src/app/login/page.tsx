"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";

import { Button, Card, CardSection, Card, CardTitleText } from "@godxjp/ui";

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
        <Card className="text-center">
          <CardTitleText className="text-2xl font-bold">DXS Product</CardTitleText>
          <p className="text-muted-foreground text-sm">Sign in with your organization account</p>
        </Card>
        <CardSection>
          <Button onClick={handleSsoLogin} className="w-full" size="lg">
            Sign in with SSO
          </Button>
        </CardSection>
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
