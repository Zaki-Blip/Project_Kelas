import { ImageResponse } from "next/og";

export const alt = "KaryaKelas — Katalog Karya Kelas XII RPL 1";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#faf7f0",
          fontFamily: "sans-serif",
          color: "#111111",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "#ffd83d",
              border: "3px solid #111111",
              borderRadius: "12px",
              boxShadow: "4px 4px 0 #111111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 800,
            }}
          >
            K
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            KaryaKelas
          </span>
          <span
            style={{
              marginLeft: "12px",
              padding: "6px 16px",
              background: "#2f5bff",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: 700,
              borderRadius: "999px",
              border: "2px solid #111111",
            }}
          >
            XII RPL 1
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
            }}
          >
            Karya nyata, dari kelas kami.
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#5a5a5a",
              maxWidth: "900px",
              lineHeight: 1.4,
            }}
          >
            Katalog proyek hasil karya siswa: temukan karya, lihat profil kelas, dan coba pratinjau langsung.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "3px solid #111111",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "32px", fontSize: "20px", fontWeight: 700 }}>
            <span>⭐ Galeri Terkurasi</span>
            <span>🚀 Live Preview</span>
            <span>👥 Profil Kelas</span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#2f5bff" }}>
            XII RPL 1
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
