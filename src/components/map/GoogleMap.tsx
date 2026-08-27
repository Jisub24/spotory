"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsSdk } from "@/lib/google/loadGoogleMapsSdk";
import { usePlaces } from "@/hooks/usePlaces";
import { PlaceMarker } from "./PlaceMarker";

// 서울시청 - 위치 권한이 없거나 거부된 경우의 대체 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

function getCurrentPositionOrDefault(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => resolve(DEFAULT_CENTER),
      { timeout: 5000 }
    );
  });
}

export function GoogleMap({
  onMapReady,
}: {
  onMapReady?: (map: google.maps.Map) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { places } = usePlaces();

  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;

    // 구글 지도는 API 키/결제 인증에 실패해도 JS 에러를 던지지 않고,
    // 대신 이 전역 콜백을 호출한다. 안 잡아두면 화면엔 빈 박스만 남고
    // 원인을 알 방법이 없어서 명시적으로 에러 상태로 연결해둔다.
    (window as unknown as Record<string, () => void>).gm_authFailure = () => {
      if (!cancelled) {
        setError(
          "구글 지도 인증에 실패했습니다. API 키 또는 결제 설정을 확인해주세요."
        );
      }
    };

    loadGoogleMapsSdk()
      .then(() => getCurrentPositionOrDefault())
      .then((center) => {
        if (cancelled || !container) return;
        const instance = new google.maps.Map(container, {
          center,
          zoom: 15,
          mapId: "DEMO_MAP_ID",
          mapTypeControl: false,
        });
        setMap(instance);
        onMapReady?.(instance);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      // Google Maps SDK엔 인스턴스를 없애는 API가 없어서, 개발 모드 Strict Mode의
      // 마운트→정리→재마운트 사이클에서 지도가 중복 생성되지 않도록 DOM을 직접 비운다.
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [onMapReady]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {map &&
        places.map((place) => (
          <PlaceMarker key={place.id} map={map} place={place} />
        ))}
    </div>
  );
}
