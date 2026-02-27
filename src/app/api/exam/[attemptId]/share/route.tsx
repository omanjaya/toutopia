import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId, status: "COMPLETED" },
    select: {
      score: true,
      totalCorrect: true,
      totalIncorrect: true,
      totalUnanswered: true,
      percentile: true,
      user: { select: { name: true } },
      package: { select: { title: true, totalQuestions: true } },
    },
  });

  if (!attempt) {
    return new Response("Not found", { status: 404 });
  }

  const score = Math.round(attempt.score ?? 0);
  const percentile = attempt.percentile ? Math.round(attempt.percentile) : null;
  const userName = attempt.user.name ?? "Peserta";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.15)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "50px",
            fontSize: "28px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Toutopia
        </div>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.7)",
              display: "flex",
            }}
          >
            {userName}
          </div>

          <div
            style={{
              fontSize: "20px",
              color: "rgba(255,255,255,0.6)",
              display: "flex",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            {attempt.package.title}
          </div>

          {/* Score */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "120px",
                fontWeight: 800,
                lineHeight: 1,
                display: "flex",
                background: "linear-gradient(to bottom, #ffffff, #93c5fd)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontSize: "28px",
                color: "rgba(255,255,255,0.5)",
                display: "flex",
              }}
            >
              dari 1000
            </div>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "flex",
              gap: "48px",
              fontSize: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div style={{ color: "#4ade80", fontWeight: 700, display: "flex" }}>
                {attempt.totalCorrect ?? 0}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", display: "flex" }}>
                Benar
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div style={{ color: "#f87171", fontWeight: 700, display: "flex" }}>
                {attempt.totalIncorrect ?? 0}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", display: "flex" }}>
                Salah
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, display: "flex" }}>
                {attempt.totalUnanswered ?? 0}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", display: "flex" }}>
                Kosong
              </div>
            </div>
            {percentile !== null && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div style={{ color: "#60a5fa", fontWeight: 700, display: "flex" }}>
                  {percentile}%
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", display: "flex" }}>
                  Persentil
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.4)",
            display: "flex",
          }}
        >
          toutopia.id
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
