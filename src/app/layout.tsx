import type { Metadata } from "next";
import localFont from "next/font/local";

import "@/app/globals.css";

const display = localFont({
  variable: "--font-display",
  src: [
    {
      path: "../fonts/space-grotesk-400.ttf",
      style: "normal",
      weight: "400"
    },
    {
      path: "../fonts/space-grotesk-700.ttf",
      style: "normal",
      weight: "700"
    }
  ]
});

const body = localFont({
  variable: "--font-body",
  src: [
    {
      path: "../fonts/manrope-400.ttf",
      style: "normal",
      weight: "400"
    },
    {
      path: "../fonts/manrope-700.ttf",
      style: "normal",
      weight: "700"
    }
  ]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://www.zegendia.com"),
  title: "Zegendia",
  description: "Loyalty and rewards systems for Latin America.",
  icons: {
    icon: [{ url: "/favicon-zegendia-mark-v2.png", type: "image/png" }],
    shortcut: ["/favicon-zegendia-mark-v2.png"],
    apple: [{ url: "/favicon-zegendia-mark-v2.png" }]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
