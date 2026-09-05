import type { Place } from "@/types/domain";

const PIN_COLOR = "#515F80";

// 마커를 만들기만 하고 지도에 붙이지는 않는다. 지도 부착은 클러스터러(MarkerClusterer)가
// 확대 수준에 따라 알아서 처리한다 (가까운 마커들을 하나로 묶어서 보여줌).
export function createPlaceMarker({
  place,
  onClick,
}: {
  place: Place;
  onClick: () => void;
}) {
  // 핀 위에 장소명 라벨, 그 아래에 민트색 위치 핀 아이콘을 세로로 쌓는다.
  const outer = document.createElement("div");
  outer.className = "place-marker";
  outer.style.cssText =
    "display:flex;flex-direction:column;align-items:center;";

  const label = document.createElement("div");
  label.textContent = place.name;
  label.style.cssText =
    `margin-bottom:2px;padding:2px 6px;border-radius:8px;background:#fff;color:#111;font-size:11px;font-weight:600;white-space:normal;text-align:center;width:80px;line-height:1.3;border:1.5px solid ${PIN_COLOR};box-shadow:0 1px 2px rgba(0,0,0,0.15);`;
  outer.appendChild(label);

  const pinBox = document.createElement("div");
  pinBox.style.position = "relative";
  pinBox.style.width = "48px";
  pinBox.style.height = "48px";
  pinBox.innerHTML = `
    <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="${PIN_COLOR}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  // 기록이 2개 이상인 장소는 핀 오른쪽 위 바깥에 작은 배지로 개수를 표시한다.
  if (place.memoryCount > 1) {
    const badge = document.createElement("span");
    badge.textContent = String(place.memoryCount);
    badge.style.cssText =
      "position:absolute;top:-2px;right:-2px;min-width:20px;height:20px;padding:0 5px;border-radius:9999px;background:#000;color:#fff;font-size:12px;line-height:20px;text-align:center;";
    pinBox.appendChild(badge);
  }

  outer.appendChild(pinBox);

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: place.lat, lng: place.lng },
    title: place.name,
    content: outer,
    gmpClickable: true,
  });

  marker.addListener("gmp-click", onClick);

  return marker;
}
