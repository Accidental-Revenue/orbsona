import { ImageResponse } from "next/og";

export const alt = "Orbsona — living identities for AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "74px 86px",
        background: "#090909",
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 650 }}>
        <div style={{ fontSize: 28, color: "#9a9a9a", marginBottom: 24 }}>
          Open source · MIT
        </div>
        <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: "-4px" }}>
          Orbsona
        </div>
        <div style={{ marginTop: 22, fontSize: 38, lineHeight: 1.2, color: "#c9c9c9" }}>
          Living identities for AI agents.
        </div>
      </div>
      <div
        style={{
          width: 340,
          height: 340,
          borderRadius: 999,
          border: "2px solid rgba(255,255,255,0.22)",
          background:
            "radial-gradient(circle at 32% 28%, #effdff 0%, #8bd7ff 15%, #3475dc 46%, #172f78 75%, #080d22 100%)",
          boxShadow: "0 0 90px rgba(72,146,255,0.36), inset -55px -60px 85px rgba(0,0,0,0.34)",
        }}
      />
    </div>,
    size,
  );
}
