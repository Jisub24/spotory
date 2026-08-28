"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// 서울시청 - 아직 기록이 하나도 없는 사용자를 위한 대체 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

type LastMemoryPlaceRow = {
  places: { lat: number; lng: number } | null;
};

export function useLastMemoryPlace() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("memories")
      .select("places(lat, lng)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const place = (data as LastMemoryPlaceRow | null)?.places;
        if (place) setCenter({ lat: place.lat, lng: place.lng });
        setLoading(false);
      });
  }, []);

  return { center, loading };
}
