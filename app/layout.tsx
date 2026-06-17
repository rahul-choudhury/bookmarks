import { cn } from "@rahul-choudhury/ui";
import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CommandPalette } from "@/components/command-palette";
import { MobileHaptics } from "@/components/mobile-haptics";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
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
        className={cn(
          satoshi.className,
          satoshi.variable,
          instrumentSerif.variable,
          jetBrainsMono.variable,
          "bg-bg text-text antialiased",
        )}
      >
        <MobileHaptics />
        <div className="root">{children}</div>
        <CommandPalette />
      </body>
    </html>
  );
}
