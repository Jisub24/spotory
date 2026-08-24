"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Place } from "@/types/domain";

type PlaceRow = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  created_by: string;
  created_at: string;
};

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("places")
      .select("*")
      .then(({ data }) => {
        setPlaces(
          ((data ?? []) as PlaceRow[]).map((row) => ({
            id: row.id,
            name: row.name,
            lat: row.lat,
            lng: row.lng,
            createdBy: row.created_by,
            createdAt: row.created_at,
          }))
        );
        setLoading(false);
      });
  }, []);

  return { places, loading };
}
