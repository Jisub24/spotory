"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoSdk } from "@/lib/kakao/loadKakaoSdk";

// 서울시청 - 검색/현재 위치 기능이 아직 없어서 임시로 잡아둔 기본 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export function KakaoMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadKakaoSdk()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(
            DEFAULT_CENTER.lat,
            DEFAULT_CENTER.lng
          ),
          level: 4,
        });
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      // Kakao Maps SDK엔 인스턴스를 없애는 API가 없어서, 개발 모드 Strict Mode의
      // 마운트→정리→재마운트 사이클에서 지도가 중복 생성되지 않도록 DOM을 직접 비운다.
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
