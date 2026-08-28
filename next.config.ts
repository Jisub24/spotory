import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 로컬 개발 중 같은 와이파이의 폰 등 다른 기기로 접속해서 테스트할 때,
  // Next.js가 보안상 기본 차단하는 dev 리소스(JS 청크, HMR)를 허용한다.
  allowedDevOrigins: ["192.168.45.159"],
  experimental: {
    // Server Action 요청 본문은 기본 1MB로 제한돼 있어서, 사진 여러 장을 첨부하면
    // 바로 초과한다. 기록 하나에 사진 최대 10장(휴대폰 원본 기준)을 감안해 넉넉히 올린다.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
