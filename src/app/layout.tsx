import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // 링크 공유 미리보기(og:image)의 절대 경로를 만들 때 쓰인다. Vercel이 배포 도메인을
  // 자동으로 넘겨주는 환경변수를 쓰고, 로컬 개발에서만 localhost로 대체한다.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: "Spotory",
  description: "장소마다 쌓이는 나만의 이야기",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
