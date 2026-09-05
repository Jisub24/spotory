"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { loadGoogleMapsSdk } from "@/lib/google/loadGoogleMapsSdk";
import type { Place } from "@/types/domain";
import { createPlaceMarker } from "./createPlaceMarker";
import { clusterRenderer } from "./clusterRenderer";

export function GoogleMap({
  places,
  initialCenter,
  onMapReady,
}: {
  places: Place[];
  initialCenter: { lat: number; lng: number };
  onMapReady?: (map: google.maps.Map) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Cloud 스타일이 늦게 도착해서 기본 디자인이 잠깐 보였다가 커스터마이징 된 지도로
  // 바뀌는 게 눈에 띄어서, 스타일까지 다 입혀질 때까지는 테마색으로 가려둔다.
  const [styleReady, setStyleReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

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
      .then(() => {
        if (cancelled || !container) return;

        // 위치 권한 확인을 기다리지 않고, 넘겨받은 기본 좌표로 지도를 바로 띄운다.
        const instance = new google.maps.Map(container, {
          center: initialCenter,
          zoom: 15,
          mapId: "e9ffe44c2fe9bf8d28ccc541",
          mapTypeControl: false,
          zoomControl: false,
          cameraControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          // Cloud 스타일이 도착하기 전까지 빈 타일 자리에 기본 회색 대신
          // 우리 테마색이 먼저 보이게 해서, 스타일 전환 시 화면이 덜 튀어 보이게 한다.
          backgroundColor: "#F0F2F8",
        });
        setMap(instance);
        onMapReady?.(instance);

        google.maps.event.addListenerOnce(instance, "tilesloaded", () => {
          if (!cancelled) setStyleReady(true);
        });
        // tilesloaded가 안 오는 드문 경우를 대비한 폴백.
        fallbackTimer = setTimeout(() => {
          if (!cancelled) setStyleReady(true);
        }, 1500);

        // 위치 권한은 지도가 이미 뜬 뒤, 별도로 물어봐서 되면 그때 살짝 이동만 시킨다.
        // 응답이 늦거나 거부돼도 사용자는 이미 지도를 보고 있어서 기다릴 필요가 없다.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (cancelled) return;
              instance.panTo({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            () => {},
            { timeout: 5000 }
          );
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      // Google Maps SDK엔 인스턴스를 없애는 API가 없어서, 개발 모드 Strict Mode의
      // 마운트→정리→재마운트 사이클에서 지도가 중복 생성되지 않도록 DOM을 직접 비운다.
      if (container) {
        container.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMapReady]);

  // 장소 마커들을 만들어서 클러스터러에 한 번에 넘긴다. 클러스터러가 확대 수준에 따라
  // 가까운 마커들을 하나로 묶어서 보여주고, 확대해 들어가면 다시 낱개로 풀어준다.
  useEffect(() => {
    if (!map) return;

    const markers = places.map((place) =>
      createPlaceMarker({
        place,
        onClick: () => router.push(`/places/${place.id}`),
      })
    );
    const clusterer = new MarkerClusterer({
      map,
      markers,
      renderer: clusterRenderer,
    });

    return () => {
      clusterer.clearMarkers();
      markers.forEach((marker) => {
        marker.map = null;
      });
    };
  }, [map, places, router]);

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
      <div
        className={`pointer-events-none absolute inset-0 bg-[#F0F2F8] transition-opacity duration-300 ${
          styleReady ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
