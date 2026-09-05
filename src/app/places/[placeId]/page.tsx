import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/BackButton";
import { AiSummary } from "@/components/memory/AiSummary";
import { MemoryTimelineItem } from "@/components/memory/MemoryTimelineItem";

const MIN_MEMORIES_FOR_SUMMARY = 3;

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
    .select(
      "id, name, ai_summary, ai_summary_generated_at, ai_summary_memory_count"
    )
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
    <div className="min-h-dvh bg-page animate-page-enter">
      <div className="flex items-center gap-3 bg-white px-6 py-4">
        <BackButton fallbackHref="/map" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">
            <Link href="/map">{place.name}</Link>
          </h1>
          {memories.length > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">
              {memories.length}번째 방문 · 처음 기록한 날{" "}
              {memories[memories.length - 1].memory_date
                .slice(0, 10)
                .replace(/-/g, ".")}
            </p>
          )}
        </div>
        <Link
          href={`/places/${placeId}/new`}
          aria-label="이야기 쌓기"
          className="press-strong flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1.5V14.5M1.5 8H14.5"
              stroke="#515F80"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>

      <div className="space-y-4 p-4">
        {memories.length >= MIN_MEMORIES_FOR_SUMMARY ? (
          <AiSummary
            placeId={placeId}
            placeName={place.name}
            initialSummary={place.ai_summary}
            needsRefresh={
              !place.ai_summary ||
              // 기록이 삭제된 경우엔(요약이 이미 없는 기록을 언급하고 있을 수 있으니)
              // 하나만 줄어도 바로 갱신한다. 늘어나는 경우엔 비용을 아끼려고
              // 2개 이상 쌓였을 때만 갱신한다.
              memories.length < place.ai_summary_memory_count ||
              memories.length - place.ai_summary_memory_count >= 2
            }
          />
        ) : (
          memories.length > 0 && (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
              이야기가 3개 이상 쌓이면 이 장소의 이야기를 만들어드려요
            </p>
          )
        )}

        {memories.length === 0 && (
          <p className="text-sm text-gray-500">아직 남긴 기록이 없어요.</p>
        )}
        {memories.length > 0 && (
          <div className="relative">
            {/* 기록들을 잇는 세로 타임라인 선 */}
            <div className="absolute top-2 bottom-2 left-0.75 w-px bg-timeline-line" />
            <div className="space-y-6">
              {memories.map((memory, i) => (
                <MemoryTimelineItem
                  key={memory.id}
                  memory={memory}
                  ordinal={memories.length - i}
                  defaultOpen={i === 0}
                  photos={memory.photo_urls
                    .map((path) => ({ path, url: urlByPath.get(path) }))
                    .filter(
                      (p): p is { path: string; url: string } => !!p.url
                    )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
