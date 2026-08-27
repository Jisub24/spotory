"use client";

import { useEffect, useRef } from "react";

export function SearchOverlay({ map }: { map: google.maps.Map }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const autocomplete = new google.maps.places.PlaceAutocompleteElement({
      locationBias: map.getBounds() ?? undefined,
    });
    container.appendChild(autocomplete);

    autocomplete.addEventListener("gmp-select", async (event) => {
      const { place } = await event.placePrediction
        .toPlace()
        .fetchFields({ fields: ["displayName", "location"] });

      if (!place.location) return;

      map.panTo(place.location);
      map.setZoom(16);

      if (markerRef.current) markerRef.current.map = null;
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName ?? undefined,
      });
    });

    return () => {
      autocomplete.remove();
      if (markerRef.current) markerRef.current.map = null;
    };
  }, [map]);

  return (
    <div className="mx-4 min-w-0 max-w-sm flex-1 overflow-hidden rounded-full border border-gray-300 px-2">
      <div ref={containerRef} />
    </div>
  );
}
