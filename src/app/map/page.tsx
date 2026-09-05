"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleMap } from "@/components/map/GoogleMap";
import { SearchOverlay } from "@/components/map/SearchOverlay";
import { usePlaces } from "@/hooks/usePlaces";
import { useLastMemoryPlace } from "@/hooks/useLastMemoryPlace";
import { Logo } from "@/components/ui/Logo";

export default function MapPage() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const {
    places,
    loading: placesLoading,
    error: placesError,
  } = usePlaces();
  const { center, loading: centerLoading } = useLastMemoryPlace();

  return (
    <div className="flex h-dvh flex-col bg-page">
      <div className="flex items-center bg-white px-6 py-4">
        <Link href="/home" className="-m-2 p-2">
          <Logo className="text-lg" />
        </Link>
        {map && <SearchOverlay map={map} />}
      </div>
      <div className="relative flex-1 p-4">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          {centerLoading ? (
            <div className="h-full w-full animate-pulse bg-gray-200" />
          ) : (
            <div className="animate-page-enter h-full w-full">
              <GoogleMap
                places={places}
                initialCenter={center}
                onMapReady={setMap}
              />
            </div>
          )}
        </div>
        {!placesLoading && !placesError && places.length === 0 && (
          // 기록을 처음 남기는 사용자에게만 해당 문구 보이게 함
          <div className="pointer-events-none absolute inset-x-4 top-8 flex justify-center">
            <p className="rounded-full border border-primary bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
              위 검색창에서 장소를 찾아 첫 기록을 남겨보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
