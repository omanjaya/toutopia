interface PaymentEmailParams {
  name: string;
  packageTitle: string;
  amount: number;
  transactionId: string;
}

export function paymentSuccessEmailHtml({ name, packageTitle, amount, transactionId }: PaymentEmailParams): string {
  const formattedAmount = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#16a34a;padding:32px 24px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">Pembayaran Berhasil</h1>
        </td></tr>
        <tr><td style="padding:32px 24px">
          <p style="margin:0 0 16px;color:#18181b;font-size:16px">Halo <strong>${name}</strong>,</p>
          <p style="margin:0 0 24px;color:#52525b;font-size:14px;line-height:1.6">
            Pembayaran kamu telah dikonfirmasi. Berikut detailnya:
          </p>
          <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;font-size:14px">
            <tr style="background:#f4f4f5"><td style="color:#71717a">Paket</td><td style="color:#18181b;font-weight:600">${packageTitle}</td></tr>
            <tr><td style="color:#71717a">Total</td><td style="color:#18181b;font-weight:600">${formattedAmount}</td></tr>
            <tr style="background:#f4f4f5"><td style="color:#71717a">ID Transaksi</td><td style="color:#18181b;font-family:monospace;font-size:12px">${transactionId}</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:24px 0">
              <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://toutopia.id"}/dashboard/tryout"
                 style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600">
                Mulai Try Out
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
