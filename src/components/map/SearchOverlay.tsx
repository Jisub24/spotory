"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function SearchOverlay({ map }: { map: google.maps.Map }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const autocomplete = new google.maps.places.PlaceAutocompleteElement({
      locationBias: map.getBounds() ?? undefined,
    });
    // 포커스 시 WebKit이 커스텀 엘리먼트 자체에 기본으로 씌우는 테두리/그림자를 지운다.
    // (내부 input이 아니라 이 호스트 엘리먼트가 실제로 :focus를 받는 것으로 보인다.)
    autocomplete.style.cssText =
      "outline:none;box-shadow:none;border:none;-webkit-tap-highlight-color:transparent;";
    container.appendChild(autocomplete);

    // 내 실제 위치를 기준으로 가까운 순으로 검색 결과가 나오도록, 지도 화면 범위 대신
    // 현재 위치 반경으로 편향(bias)을 좁히고 거리 계산 기준점(origin)도 같이 지정한다.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const here = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          autocomplete.origin = here;
          autocomplete.locationBias = { center: here, radius: 3000 };
        },
        (err) => {
          // http(비보안) 환경이나 권한 거부 시 여기로 오는데, 원인 확인용으로 남겨둔다.
          console.warn("위치 정보를 가져오지 못했습니다:", err.message);
        },
        { timeout: 5000 }
      );
    }

    // 선택한 장소를 바로 저장하지 않고, 기록 작성 화면으로 넘겨서
    // 실제로 기록을 남겨야만 장소가 저장되도록 한다.
    autocomplete.addEventListener("gmp-select", async (event) => {
      const { place } = await event.placePrediction
        .toPlace()
        .fetchFields({ fields: ["id", "displayName", "location"] });

      if (!place.location) return;

      const params = new URLSearchParams({
        name: place.displayName ?? "",
        lat: String(place.location.lat()),
        lng: String(place.location.lng()),
        googlePlaceId: place.id,
      });
      router.push(`/places/new?${params.toString()}`);
    });

    return () => {
      autocomplete.remove();
    };
  }, [map, router]);

  return (
    <div className="ml-4 min-w-0 max-w-xl flex-1 rounded-2xl border border-gray-300 px-2 py-1">
      <div ref={containerRef} />
    </div>
  );
}
