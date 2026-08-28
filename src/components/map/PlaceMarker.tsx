"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Place } from "@/types/domain";

export function PlaceMarker({
  map,
  place,
}: {
  map: google.maps.Map;
  place: Place;
}) {
  const router = useRouter();

  useEffect(() => {
    // 기본 PinElement 대신 민트색 위치 핀 아이콘을 직접 그린다.
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "48px";
    wrapper.style.height = "48px";
    wrapper.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#5EEAD4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `;

    // 기록이 2개 이상인 장소는 핀 오른쪽 위 바깥에 작은 배지로 개수를 표시한다.
    if (place.memoryCount > 1) {
      const badge = document.createElement("span");
      badge.textContent = String(place.memoryCount);
      badge.style.cssText =
        "position:absolute;top:-2px;right:-2px;min-width:20px;height:20px;padding:0 5px;border-radius:9999px;background:#000;color:#fff;font-size:12px;line-height:20px;text-align:center;";
      wrapper.appendChild(badge);
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: place.lat, lng: place.lng },
      title: place.name,
      content: wrapper,
      gmpClickable: true,
    });

    marker.addListener("gmp-click", () => {
      router.push(`/places/${place.id}`);
    });

    return () => {
      marker.map = null;
    };
  }, [map, place, router]);

  return null;
}
