function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeVerifyUrl(url: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id";
  if (url.startsWith(appUrl + "/")) return url;
  return appUrl;
}

export function verifyEmailHtml(name: string, verifyUrl: string): string {
  const safeUrl = safeVerifyUrl(verifyUrl);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#2563eb;padding:32px 24px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">Verifikasi Email</h1>
        </td></tr>
        <tr><td style="padding:32px 24px">
          <p style="margin:0 0 16px;color:#18181b;font-size:16px">Halo <strong>${escapeHtml(name)}</strong>,</p>
          <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6">
            Terima kasih telah mendaftar di Toutopia! Klik tombol di bawah untuk memverifikasi alamat email kamu.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:16px 0">
              <a href="${escapeHtml(safeUrl)}"
                 style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600">
                Verifikasi Email
              </a>
            </td></tr>
          </table>
          <p style="margin:16px 0 0;color:#71717a;font-size:12px;line-height:1.6">
            Link ini akan kadaluarsa dalam 24 jam. Jika kamu tidak mendaftar di Toutopia, abaikan email ini.
          </p>
          <p style="margin:16px 0 0;color:#a1a1aa;font-size:11px;word-break:break-all">
            ${escapeHtml(safeUrl)}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
