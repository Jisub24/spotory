import type { Renderer } from "@googlemaps/markerclusterer";
import { MARK_COLOR } from "@/lib/theme";

// 클러스터 마커 기본 파란색 대신, 우리 마커랑 같은 민트색으로 그린다.
export const clusterRenderer: Renderer = {
  render: ({ count, position }) => {
    const div = document.createElement("div");
    div.style.cssText = "position:relative;width:45px;height:45px;";
    div.innerHTML = `
      <svg width="45" height="45" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="120" r="70" fill="${MARK_COLOR}" opacity="0.6" />
        <circle cx="120" cy="120" r="90" fill="${MARK_COLOR}" opacity="0.3" />
        <circle cx="120" cy="120" r="110" fill="${MARK_COLOR}" opacity="0.2" />
        <circle cx="120" cy="120" r="130" fill="${MARK_COLOR}" opacity="0.1" />
      </svg>
      <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#000;font-size:12px;font-weight:700;">${count}</span>
    `;

    return new google.maps.marker.AdvancedMarkerElement({
      position,
      content: div,
    });
  },
};
