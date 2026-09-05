"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MARK_COLOR } from "@/lib/theme";
import { hasFinalConsonant } from "@/lib/format/hangul";

type PendingPlace = {
  name: string;
  lat: number;
  lng: number;
  googlePlaceId: string;
};

export function SearchOverlay({ map }: { map: google.maps.Map }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [pending, setPending] = useState<PendingPlace | null>(null);
  const previewMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const autocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(
    null
  );

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
    autocompleteRef.current = autocomplete;

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

    // 선택 즉시 기록 화면으로 넘기지 않고, 지도에 핀부터 찍어서 맞는 장소인지
    // 한 번 확인받은 뒤에만 넘어가도록 한다. (동명 장소 오선택 방지)
    autocomplete.addEventListener("gmp-select", async (event) => {
      const { place } = await event.placePrediction
        .toPlace()
        .fetchFields({ fields: ["id", "displayName", "location"] });

      if (!place.location) return;

      // 엔터 없이 목록에서 바로 탭해서 선택하면 모바일 키보드가 안 닫혀서
      // 하단 확인창을 가리는 문제가 있어, 선택 즉시 포커스를 강제로 뺀다.
      (document.activeElement as HTMLElement | null)?.blur();

      const location = {
        lat: place.location.lat(),
        lng: place.location.lng(),
      };

      if (previewMarkerRef.current) {
        previewMarkerRef.current.map = null;
      }

      const pinBox = document.createElement("div");
      pinBox.style.cssText = "width:40px;height:40px;";
      pinBox.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="${MARK_COLOR}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      previewMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: location,
        content: pinBox,
      });
      map.panTo(location);

      setPending({
        name: place.displayName ?? "",
        lat: location.lat,
        lng: location.lng,
        googlePlaceId: place.id,
      });
    });

    return () => {
      autocomplete.remove();
      autocompleteRef.current = null;
    };
  }, [map]);

  const clearPreviewMarker = () => {
    if (previewMarkerRef.current) {
      previewMarkerRef.current.map = null;
      previewMarkerRef.current = null;
    }
  };

  const handleConfirm = () => {
    if (!pending) return;
    const params = new URLSearchParams({
      name: pending.name,
      lat: String(pending.lat),
      lng: String(pending.lng),
      googlePlaceId: pending.googlePlaceId,
    });
    clearPreviewMarker();
    setPending(null);
    router.push(`/places/new?${params.toString()}`);
  };

  const handleCancel = () => {
    clearPreviewMarker();
    setPending(null);
    if (autocompleteRef.current) {
      autocompleteRef.current.value = "";
    }
  };

  return (
    <>
      <div className="ml-4 min-w-0 max-w-xl flex-1 rounded-xl border border-gray-300 px-2 py-0.5">
        <div ref={containerRef} />
      </div>

      <ConfirmDialog
        open={pending !== null}
        variant="sheet"
        title={
          pending && (
            <>
              <span style={{ color: MARK_COLOR }}>{pending.name}</span>
              {hasFinalConsonant(pending.name) ? "이" : "가"} 맞나요?
            </>
          )
        }
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
