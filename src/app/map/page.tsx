import { createClient } from "@/lib/supabase/server";
import { mapPlaceRow, type PlaceRow } from "@/lib/supabase/mapPlace";
import { MapView } from "./MapView";

export default async function MapPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("places").select("*, memories(count)");

  const places = ((data ?? []) as PlaceRow[]).map(mapPlaceRow);

  return <MapView places={places} />;
}
