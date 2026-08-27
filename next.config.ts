import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 로컬 개발 중 같은 와이파이의 폰 등 다른 기기로 접속해서 테스트할 때,
  // Next.js가 보안상 기본 차단하는 dev 리소스(JS 청크, HMR)를 허용한다.
  allowedDevOrigins: ["192.168.45.159"],
};

export default nextConfig;
