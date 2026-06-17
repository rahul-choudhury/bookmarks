import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Bookmarks - A keyboard-focused bookmark manager";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function BookmarksMark() {
  return (
    <svg
      aria-hidden="true"
      width="172"
      height="172"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#e5e5e5"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function BookmarksSubtitle() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span
        style={{
          background: "#f5f5f5",
          border: "1px solid #e5e5e5",
          padding: "6px 14px",
          borderRadius: 8,
          fontFamily: "JetBrainsMono",
          fontSize: 18,
          color: "#737373",
          letterSpacing: "0.02em",
        }}
      >
        kbd
      </span>
      <span>focused bookmark manager</span>
    </div>
  );
}

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#fafafa",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        fontFamily: "Satoshi",
        color: "#171717",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            fontFamily: "InstrumentSerif",
            fontSize: 96,
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "#171717",
          }}
        >
          Bookmarks
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#737373",
            letterSpacing: "0.02em",
            marginTop: "8px",
            lineHeight: 1.4,
          }}
        >
          <BookmarksSubtitle />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrainsMono",
            fontSize: 18,
            color: "#a3a3a3",
            letterSpacing: "0.02em",
          }}
        >
          bookmarks.rchoudhury.dev
        </div>
        <BookmarksMark />
      </div>
    </div>,
    {
      ...size,
      fonts: await Promise.all([
        readFile(
          path.join(
            process.cwd(),
            "public/og-fonts/InstrumentSerif-Regular.ttf",
          ),
        ).then((data) => ({
          name: "InstrumentSerif",
          data,
          style: "normal" as const,
          weight: 400 as const,
        })),
        readFile(
          path.join(process.cwd(), "public/og-fonts/Satoshi-Regular.ttf"),
        ).then((data) => ({
          name: "Satoshi",
          data,
          style: "normal" as const,
          weight: 400 as const,
        })),
        readFile(
          path.join(process.cwd(), "public/og-fonts/JetBrainsMono-Regular.ttf"),
        ).then((data) => ({
          name: "JetBrainsMono",
          data,
          style: "normal" as const,
          weight: 400 as const,
        })),
      ]),
    },
  );
}
