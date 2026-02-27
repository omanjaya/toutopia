interface ScoreEmailParams {
  name: string;
  packageTitle: string;
  score: number;
  attemptId: string;
}

export function scoreResultEmailHtml({ name, packageTitle, score, attemptId }: ScoreEmailParams): string {
  const roundedScore = Math.round(score);
  const scoreColor = roundedScore >= 700 ? "#16a34a" : roundedScore >= 500 ? "#d97706" : "#dc2626";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#2563eb;padding:32px 24px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">Hasil Ujian Tersedia</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;text-align:center">
          <p style="margin:0 0 8px;color:#52525b;font-size:14px">${packageTitle}</p>
          <p style="margin:0 0 8px;color:${scoreColor};font-size:56px;font-weight:700;line-height:1">${roundedScore}</p>
          <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px">dari 1000 poin</p>
          <p style="margin:0 0 8px;color:#18181b;font-size:16px">Halo <strong>${name}</strong>,</p>
          <p style="margin:0 0 24px;color:#52525b;font-size:14px;line-height:1.6">
            Hasil ujian kamu sudah tersedia. Lihat pembahasan lengkap untuk mengetahui jawaban yang benar.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id"}/exam/${attemptId}/result"
             style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600">
            Lihat Hasil Lengkap
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
