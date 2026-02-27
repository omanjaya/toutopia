import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get("score") ?? "0";
  const title = searchParams.get("title") ?? "Try Out";
  const correct = searchParams.get("correct") ?? "0";
  const total = searchParams.get("total") ?? "0";

  const scoreNum = parseInt(score);
  const scoreColor = scoreNum >= 700 ? "#059669" : scoreNum >= 500 ? "#d97706" : "#dc2626";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px",
            backgroundColor: "white",
            borderRadius: "24px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
          }}
        >
          <div style={{ fontSize: 24, color: "#64748b", marginBottom: 8 }}>
            Toutopia
          </div>
          <div style={{ fontSize: 20, color: "#334155", marginBottom: 24 }}>
            {title}
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: scoreColor,
              lineHeight: 1,
            }}
          >
            {score}
          </div>
          <div style={{ fontSize: 18, color: "#94a3b8", marginTop: 8 }}>
            dari 1000 poin
          </div>
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: 32,
              fontSize: 16,
              color: "#64748b",
            }}
          >
            <span>
              {correct} benar dari {total} soal
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
