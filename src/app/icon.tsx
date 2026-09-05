import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const PIN_COLOR = "#A7B5D8";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="24" height="32" viewBox="0 0 24 32">
          <path
            d="M12 1C6.477 1 2 5.477 2 11c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z"
            fill={PIN_COLOR}
          />
          <circle cx="12" cy="11" r="4.5" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
