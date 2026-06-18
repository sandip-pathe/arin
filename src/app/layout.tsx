import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anaya - Privacy-First Legal AI",
  description:
    "Process legal documents privately with AI. Your files stay on your device. Zero data retention.",
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
