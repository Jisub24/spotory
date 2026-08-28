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
    container.appendChild(autocomplete);

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
    <div className="ml-4 min-w-0 flex-1 overflow-hidden rounded-lg border border-gray-300 px-2">
      <div ref={containerRef} />
    </div>
  );
}
