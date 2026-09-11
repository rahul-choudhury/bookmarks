import { cn } from "@rahul-choudhury/ui";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bookmarks.rchoudhury.dev"),
  title: "Bookmarks",
  description: "Save and find bookmarks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          satoshi.className,
          satoshi.variable,
          "bg-bg text-text antialiased",
        )}
      >
        <div className="root">{children}</div>
      </body>
    </html>
  );
}
