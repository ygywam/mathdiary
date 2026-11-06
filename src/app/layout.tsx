import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수학 수업 성찰 일기",
  description: "배움과 성장을 기록하는 매일 5분 수학 성찰 일기 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
