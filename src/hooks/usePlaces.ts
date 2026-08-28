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

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("places")
      .select("*, memories(count)")
      .then(({ data }) => {
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
      });
  }, []);

  return { places, loading };
}
