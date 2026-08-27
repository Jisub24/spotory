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
    <div
      ref={containerRef}
      className="absolute left-1/2 top-4 z-10 w-full max-w-sm -translate-x-1/2 px-4"
    />
  );
}
