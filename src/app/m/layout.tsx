import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Toutopia",
    template: "%s | Toutopia",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Toutopia",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function MobileRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
