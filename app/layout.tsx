import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bookmarks.rchoudhury.dev"),
  title: "Bookmarks",
  description: "<kbd /> focused bookmark manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} relative font-mono antialiased`}
      >
        {children}
        <div className="pointer-events-none fixed bottom-0 left-0 h-24 w-full bg-white/90 mask-[linear-gradient(rgba(0,0,0,0)_0%,black_100%)] blur-xs" />
      </body>
    </html>
  );
}
