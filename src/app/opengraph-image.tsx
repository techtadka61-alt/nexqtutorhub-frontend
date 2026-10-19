import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** The preview card shown when a page is shared on WhatsApp, Facebook, X, etc. (pages without their own image). */
export const alt = "NexTutorHub — verified home tutors in Sonbhadra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "src/assets/images/logo-full.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 80px",
          background: "linear-gradient(135deg, #d9f1ea 0%, #f8faf9 60%, #ffffff 100%)",
          color: "#0b3d32",
        }}
      >
        <div style={{ display: "flex", background: "#ffffff", borderRadius: 32, padding: 24, boxShadow: "0 12px 40px rgba(11,61,50,0.15)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> only */}
          <img src={logoSrc} width={340} height={180} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: "#16806b" }}>Sonbhadra · Uttar Pradesh</div>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginTop: 12 }}>Home tuition with verified local tutors</div>
          <div style={{ fontSize: 30, marginTop: 20, color: "#3d5a52" }}>
            Robertsganj · Obra · Chopan · Renukoot · Anpara — free for students and tutors
          </div>
        </div>
      </div>
    ),
    size,
  );
}
