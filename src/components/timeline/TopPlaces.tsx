"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePlaces } from "@/hooks/usePlaces";

export function TopPlaces() {
  const { places, loading: placesLoading } = usePlaces();
  const [photoByPlace, setPhotoByPlace] = useState<Map<string, string>>(
    new Map()
  );

  const top = [...places]
    .sort((a, b) => b.memoryCount - a.memoryCount)
    .slice(0, 3);
  const topIdsKey = top.map((p) => p.id).join(",");

  useEffect(() => {
    if (top.length === 0) return;
    const supabase = createClient();

    supabase
      .from("memories")
      .select("place_id, photo_urls, memory_date, created_at")
      .in("place_id", top.map((p) => p.id))
      .order("memory_date", { ascending: false })
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const rows =
          (data as {
            place_id: string;
            photo_urls: string[];
            memory_date: string;
            created_at: string;
          }[]) ?? [];

        // 정렬된 결과에서 장소별로 처음 나오는(=가장 최근) 사진 하나만 대표로 쓴다.
        const firstPhotoByPlace = new Map<string, string>();
        for (const row of rows) {
          if (firstPhotoByPlace.has(row.place_id)) continue;
          const photo = row.photo_urls?.[0];
          if (photo) firstPhotoByPlace.set(row.place_id, photo);
        }

        const paths = Array.from(firstPhotoByPlace.values());
        if (paths.length === 0) return;

        const { data: signedUrls } = await supabase.storage
          .from("memory-photos")
          .createSignedUrls(paths, 3600);

        const urlByPath = new Map(
          (signedUrls ?? []).map((entry) => [entry.path, entry.signedUrl])
        );

        const result = new Map<string, string>();
        firstPhotoByPlace.forEach((path, placeId) => {
          const url = urlByPath.get(path);
          if (url) result.set(placeId, url);
        });
        setPhotoByPlace(result);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topIdsKey]);

  if (placesLoading || top.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">가장 많이 찾은 장소</p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {top.map((place) => {
          const photoUrl = photoByPlace.get(place.id);
          return (
            <Link
              key={place.id}
              href={`/places/${place.id}`}
              className="w-32 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="h-24 w-full bg-gray-100">
                {photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-sm font-medium">{place.name}</p>
                <p className="text-xs text-gray-500">{place.memoryCount}회</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
