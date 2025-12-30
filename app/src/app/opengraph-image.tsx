import { ImageResponse } from "next/og";
import { getSiteConfig } from "@/config/site";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const cfg = getSiteConfig();
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 64,
        background: "#0B1220",
        color: "white",
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>
        {cfg.site.name}
      </div>
      <div style={{ marginTop: 24, fontSize: 28, opacity: 0.9 }}>
        {cfg.site.description}
      </div>
    </div>,
    size,
  );
}
