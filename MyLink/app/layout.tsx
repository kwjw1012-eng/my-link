import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.MYLINK_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: "마이링크 | 바이브 코딩",
  description: "바이브 코딩으로 만든 프로필과 프로젝트 링크를 한곳에 모았습니다.",
  openGraph: { type: "website", siteName: "마이링크", locale: "ko_KR", title: "마이링크", description: "나를 소개하는 단 하나의 링크." },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
