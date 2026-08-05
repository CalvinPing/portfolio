import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "linear-gradient(180deg, #cfe0e6 0%, #e3ead9 45%, #f3ead9 75%, #f6ecd8 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 60,
            right: 100,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(246,224,168,0.9) 0%, rgba(246,224,168,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            left: "-5%",
            width: "110%",
            height: 170,
            background: "#c3d2b4",
            opacity: 0.75,
            borderTopLeftRadius: "50%",
            borderTopRightRadius: "50%",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            left: "-5%",
            width: "110%",
            height: 110,
            background: "#93ab7c",
            opacity: 0.9,
            borderTopLeftRadius: "50%",
            borderTopRightRadius: "50%",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "48px 88px",
            background: "rgba(247, 243, 234, 0.95)",
            borderRadius: 40,
            boxShadow: "0 20px 50px rgba(43, 37, 33, 0.25)",
          }}
        >
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700, color: "#2b2521" }}>
            Calvin Ping
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#3f6b5c", marginTop: 18 }}>
            Computer Science @ UT Austin
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
