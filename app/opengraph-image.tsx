import { ImageResponse } from "next/og";

export const alt = "Bookmarks - A keyboard-focused bookmark manager";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          borderRadius: 8,
          marginBottom: 40,
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </div>

      <div
        style={{
          fontSize: 64,
          fontWeight: 600,
          color: "#171717",
          marginBottom: 16,
          letterSpacing: "-0.02em",
        }}
      >
        Bookmarks
      </div>

      <div
        style={{
          fontSize: 28,
          color: "#6b7280",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            background: "#f3f4f6",
            border: "1px solid #d1d5db",
            padding: "4px 12px",
            borderRadius: 4,
            fontSize: 24,
          }}
        >
          kbd
        </span>
        <span>focused bookmark manager</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
