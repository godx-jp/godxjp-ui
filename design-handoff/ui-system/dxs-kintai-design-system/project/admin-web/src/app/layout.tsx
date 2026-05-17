import { M_PLUS_2 } from "next/font/google";
import { cookies } from "next/headers";

import { Toaster } from "@godxjp/ui";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocaleCode } from "@/i18n";
import { AppProvider } from "@/providers/app-provider";
import { QueryProvider } from "@/providers/query-provider";

import type { Metadata } from "next";
import "./globals.css";

const mplus2 = M_PLUS_2({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DXS Product",
  description: "Product, inventory, and menu management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the persisted locale from the cookie so SSR and the very first
  // client paint use the same language. Without this, every navigation
  // briefly rendered the default (ja) before useEffect synced the user's
  // real preference from localStorage.
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocaleCode(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={locale}
      className={`${mplus2.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <QueryProvider>
          <AppProvider defaultLocale={locale}>
            {children}
            <Toaster position="top-right" richColors closeButton duration={3000} />
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
