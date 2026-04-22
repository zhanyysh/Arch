import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Build Control",
  description: "Architectural project management platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
