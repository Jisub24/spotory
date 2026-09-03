import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemoryCardMenu } from "@/components/memory/MemoryCardMenu";
import { formatCompanionParts } from "@/lib/format/companion";
import { BackButton } from "@/components/ui/BackButton";
import { PhotoGallery } from "@/components/memory/PhotoGallery";

type MemoryRow = {
  id: string;
  photo_urls: string[];
  comment: string | null;
  memory_date: string;
  companion: string | null;
};

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;
  const supabase = await createClient();

  const { data: place } = await supabase
    .from("places")
    .select("id, name")
    .eq("id", placeId)
    .maybeSingle();

  if (!place) notFound();

  const { data: memoriesData } = await supabase
    .from("memories")
    .select("id, photo_urls, comment, memory_date, companion")
    .eq("place_id", placeId)
    .order("memory_date", { ascending: false })
    .order("created_at", { ascending: false });

  const memories = (memoriesData ?? []) as MemoryRow[];

  // 사진 버킷이 비공개라 경로만으로는 못 보여주고, 임시 서명 URL을 받아와야 한다.
  // 기록마다 따로 요청하지 않고, 이 페이지에 있는 모든 경로를 한 번에 묶어서 요청한다.
  const allPaths = memories.flatMap((memory) => memory.photo_urls);
  const { data: signedUrls } = allPaths.length
    ? await supabase.storage
        .from("memory-photos")
        .createSignedUrls(allPaths, 3600)
    : { data: [] };

  const urlByPath = new Map(
    (signedUrls ?? []).map((entry) => [entry.path, entry.signedUrl])
  );

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <BackButton fallbackHref="/map" />
        <h1 className="flex-1 text-lg font-semibold">{place.name}</h1>
        <Link
          href={`/places/${placeId}/new`}
          className="-m-2 p-2 text-sm text-gray-500 underline"
        >
          이야기 쌓기
        </Link>
      </div>

      <div className="space-y-4 p-4">
        {memories.length === 0 && (
          <p className="text-sm text-gray-500">아직 남긴 기록이 없어요.</p>
        )}
        {memories.map((memory) => {
          const companionParts = formatCompanionParts(memory.companion);
          return (
            <div
              key={memory.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {memory.memory_date.slice(0, 10).replace(/-/g, ".")}
                  {companionParts && (
                    <>
                      {" "}
                      <span className="font-semibold text-gray-700">
                        {companionParts.who}
                      </span>{" "}
                      {companionParts.rest}
                    </>
                  )}
                </span>
                <MemoryCardMenu memoryId={memory.id} />
              </div>
              {memory.photo_urls.length > 0 && (
                <PhotoGallery
                  photos={memory.photo_urls
                    .map((path) => ({ path, url: urlByPath.get(path) }))
                    .filter(
                      (p): p is { path: string; url: string } => !!p.url
                    )}
                />
              )}
              {memory.comment && (
                <p className="mt-4 text-base font-medium">{memory.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
