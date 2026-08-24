"use client";

import { useEffect } from "react";
import type { Place } from "@/types/domain";

export function PlaceMarker({
  map,
  place,
}: {
  map: google.maps.Map;
  place: Place;
}) {
  useEffect(() => {
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: place.lat, lng: place.lng },
      title: place.name,
    });

    return () => {
      marker.map = null;
    };
  }, [map, place]);

  return null;
}
