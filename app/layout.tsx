import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BerLabs — Dispatches for the curious",
  description: "A thoughtful newsletter about AI, the internet, and what comes next.",
  metadataBase: new URL("https://news.berlabs.dev"),
  alternates: {
    canonical: "/",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
