import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArchManager",
  description: "Платформа управления архитектурными проектами"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
