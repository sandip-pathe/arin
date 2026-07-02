import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anaya - Local-First Document AI",
  description:
    "Create local-first legal and claim-document workspaces with server-routed AI analysis and exportable briefs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans antialiased h-full bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
