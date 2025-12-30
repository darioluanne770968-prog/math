import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { PWAProvider } from "@/components/PWAProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MathGPT - AI Math Tutor",
  description: "Create engaging video explanations for any STEM concept with MathGPT",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MathGPT",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "MathGPT",
    title: "MathGPT - AI Math Tutor",
    description: "Create engaging video explanations for any STEM concept",
  },
  twitter: {
    card: "summary_large_image",
    title: "MathGPT - AI Math Tutor",
    description: "Create engaging video explanations for any STEM concept",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PWAProvider>{children}</PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
