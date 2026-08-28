import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemoryForm } from "@/components/memory/MemoryForm";
import { BackButton } from "@/components/ui/BackButton";

export default async function EditMemoryPage({
  params,
}: {
  params: Promise<{ memoryId: string }>;
}) {
  const { memoryId } = await params;
  const supabase = await createClient();

  const { data: memory } = await supabase
    .from("memories")
    .select("id, place_id, photo_urls, comment, memory_date, companion")
    .eq("id", memoryId)
    .maybeSingle();

  if (!memory) notFound();

  const { data: signedUrls } = memory.photo_urls.length
    ? await supabase.storage
        .from("memory-photos")
        .createSignedUrls(memory.photo_urls, 3600)
    : { data: [] };

  const urlByPath = new Map(
    (signedUrls ?? []).map((entry) => [entry.path, entry.signedUrl])
  );

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="flex items-center border-b border-gray-200 bg-white px-6 py-4">
        <BackButton fallbackHref={`/places/${memory.place_id}`} />
      </div>
      <MemoryForm
        memory={{
          id: memory.id,
          placeId: memory.place_id,
          photos: memory.photo_urls
            .map((path: string) => ({ path, url: urlByPath.get(path) ?? "" }))
            .filter((p: { url: string }) => p.url),
          comment: memory.comment ?? "",
          memoryDate: memory.memory_date.slice(0, 10),
          companion: memory.companion,
        }}
      />
    </div>
  );
}
