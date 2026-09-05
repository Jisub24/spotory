import { ImageResponse } from "next/og";

export const alt = "Spotory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PIN_COLOR = "#A7B5D8";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F0F2F8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 140,
            fontWeight: 700,
            color: "#374151",
          }}
        >
          Sp
          <svg
            width="90"
            height="120"
            viewBox="0 0 24 32"
            style={{ margin: "0 8px" }}
          >
            <path
              d="M12 1C6.477 1 2 5.477 2 11c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z"
              fill={PIN_COLOR}
            />
            <circle cx="12" cy="11" r="4.5" fill="white" />
          </svg>
          tory
        </div>
      </div>
    ),
    { ...size }
  );
}
