"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Terjadi Kesalahan</h1>
          <p style={{ marginTop: "1rem", color: "#666" }}>
            Maaf, terjadi kesalahan yang tidak terduga.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: "2rem", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", border: "none", background: "#000", color: "#fff", cursor: "pointer", fontSize: "0.875rem" }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
