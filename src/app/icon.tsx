import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        background: "#090b10",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.28)",
          background:
            "radial-gradient(circle at 32% 28%, #e8fbff 0%, #7ed1ff 18%, #2d68d0 50%, #142b70 78%, #080d22 100%)",
          boxShadow: "0 0 14px rgba(89,169,255,0.48), inset -8px -10px 15px rgba(0,0,0,0.32)",
        }}
      />
    </div>,
    size,
  );
}
