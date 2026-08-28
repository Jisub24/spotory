"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleMap } from "@/components/map/GoogleMap";
import { SearchOverlay } from "@/components/map/SearchOverlay";
import { usePlaces } from "@/hooks/usePlaces";
import { useLastMemoryPlace } from "@/hooks/useLastMemoryPlace";

export default function MapPage() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { places, loading: placesLoading } = usePlaces();
  const { center, loading: centerLoading } = useLastMemoryPlace();

  return (
    <div className="flex h-dvh flex-col bg-gray-50">
      <div className="flex items-center border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="-m-2 p-2 text-lg font-semibold">
          Spotory
        </Link>
        {map && <SearchOverlay map={map} />}
      </div>
      <div className="relative flex-1 p-4">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          {!centerLoading && (
            <GoogleMap
              places={places}
              initialCenter={center}
              onMapReady={setMap}
            />
          )}
        </div>
        {!placesLoading && places.length === 0 && (
          <div className="pointer-events-none absolute inset-x-4 top-8 flex justify-center">
            <p className="rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
              위 검색창에서 장소를 찾아 첫 기록을 남겨보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
