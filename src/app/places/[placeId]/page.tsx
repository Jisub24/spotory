import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemoryCardMenu } from "@/components/memory/MemoryCardMenu";

type MemoryRow = {
  id: string;
  photo_urls: string[];
  comment: string | null;
  memory_date: string;
  companion: string | null;
};

// 마지막 글자의 받침 유무로 "와"/"과"를 자동으로 골라 자연스러운 조사를 붙인다.
function withParticle(word: string): string {
  const last = word.at(-1) ?? "";
  const hasFinalConsonant =
    /[가-힣]/.test(last) && (last.charCodeAt(0) - 0xac00) % 28 !== 0;
  return `${word}${hasFinalConsonant ? "과" : "와"} 함께 쌓은 이야기`;
}

// "친구 (박지섭)" 같은 저장 형식을 "친구 박지섭과 함께 쌓은 이야기" 문장으로 바꾼다.
function formatCompanionSentence(companion: string | null): string {
  if (!companion) return "";
  if (companion === "혼자") return "혼자 쌓은 이야기";

  const friendMatch = companion.match(/^친구(?: \((.+)\))?$/);
  if (friendMatch) {
    return friendMatch[1] ? withParticle(`친구 ${friendMatch[1]}`) : withParticle("친구");
  }

  return withParticle(companion);
}

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
        <Link href="/map" className="-m-2 p-2 text-gray-500">
          ←
        </Link>
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
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {memory.memory_date.slice(0, 10).replace(/-/g, ".")}
                {memory.companion &&
                  ` ${formatCompanionSentence(memory.companion)}`}
              </span>
              <MemoryCardMenu memoryId={memory.id} />
            </div>
            {memory.photo_urls.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {memory.photo_urls.map((path) => {
                  const url = urlByPath.get(path);
                  if (!url) return null;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={path}
                      src={url}
                      alt=""
                      className="h-32 w-32 shrink-0 rounded-lg object-cover"
                    />
                  );
                })}
              </div>
            )}
            {memory.comment && (
              <p className="mt-2 text-sm">{memory.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
