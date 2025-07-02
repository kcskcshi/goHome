import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "아 집에가고싶다 - 직장인 출퇴근 공유 플랫폼",
  description: "오늘도 출근했습니다. 그리고 기분은요... 직장인들의 출퇴근과 기분을 공유하는 플랫폼입니다.",
  keywords: "출근, 퇴근, 직장인, 기분공유, 출퇴근기록",
  authors: [{ name: "아 집에가고싶다" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-github-bg text-github-text`}
      >
        {children}
      </body>
    </html>
  );
}
