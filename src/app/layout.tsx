import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ClientInit } from "@/components/clientInit";
import AuthModal from "@/components/auth/auth-modal";
import Script from "next/script";
import AnalyticsWrapper from "@/components/lean/analytics-wrapper";

export const metadata: Metadata = {
  title: "Anaya",
  description: "Legal Doc Summarizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap"
          rel="stylesheet"
        />

        {/* Google Analytics */}
        {/* <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1VS2GPDGY1"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1VS2GPDGY1', {
              page_path: window.location.pathname,
            });
          `}
        </Script> */}
      </head>
      <body className="font-[Source Sans 3] antialiased h-full bg-background">
        <ClientInit />
        <AuthModal />
        {children}
        <Toaster />
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
