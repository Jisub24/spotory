"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Place } from "@/types/domain";

type PlaceRow = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  google_place_id: string;
  created_by: string;
  created_at: string;
  memories: { count: number }[];
};

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    // 모바일 네트워크가 순간적으로 끊기는 경우가 있어, 실패하면 한 번 더 시도한다.
    async function loadPlaces() {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const { data, error: fetchError } = await supabase
          .from("places")
          .select("*, memories(count)");

        if (cancelled) return;

        if (!fetchError) {
          setPlaces(
            ((data ?? []) as PlaceRow[]).map((row) => ({
              id: row.id,
              name: row.name,
              lat: row.lat,
              lng: row.lng,
              googlePlaceId: row.google_place_id,
              createdBy: row.created_by,
              createdAt: row.created_at,
              memoryCount: row.memories[0]?.count ?? 0,
            }))
          );
          setLoading(false);
          return;
        }

        console.error(`장소 목록을 불러오지 못했습니다 (시도 ${attempt}/2):`, fetchError);
        if (attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }

      if (!cancelled) {
        setError(true);
        setLoading(false);
      }
    }

    loadPlaces();

    return () => {
      cancelled = true;
    };
  }, []);

  return { places, loading, error };
}
