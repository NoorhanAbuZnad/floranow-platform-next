import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Floranow Data Platform",
  description: "Floranow Databricks Data Platform — Architecture & Migration Planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
