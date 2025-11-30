import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mersad Status",
    template: "%s | Mersad Status",
  },
  description: "Real-time status monitoring and incident history.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Mersad Status",
    description: "Real-time status monitoring and incident history.",
    siteName: "Mersad",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mersad Status",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mersad Status",
    description: "Real-time status monitoring and incident history.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
