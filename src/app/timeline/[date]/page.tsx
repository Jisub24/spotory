import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemoryCardMenu } from "@/components/memory/MemoryCardMenu";
import { formatCompanionParts } from "@/lib/format/companion";
import { BackButton } from "@/components/ui/BackButton";
import { BooksIcon } from "@/components/icons/BooksIcon";
import { MARK_COLOR } from "@/lib/theme";
import { PhotoGallery } from "@/components/memory/PhotoGallery";

type MemoryRow = {
  id: string;
  photo_urls: string[];
  comment: string | null;
  companion: string | null;
  places: { name: string } | null;
};

export default async function DayMemoriesPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const supabase = await createClient();

  const nextDay = new Date(`${date}T00:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const nextDayStr = nextDay.toISOString().slice(0, 10);

  const { data: memoriesData } = await supabase
    .from("memories")
    .select("id, photo_urls, comment, companion, memory_date, places(name)")
    .gte("memory_date", date)
    .lt("memory_date", nextDayStr)
    .order("created_at", { ascending: false });

  const memories = (memoriesData ?? []) as unknown as MemoryRow[];

  if (memories.length === 0) notFound();

  // 사진 버킷이 비공개라 경로만으로는 못 보여주고, 임시 서명 URL을 받아와야 한다.
  const allPaths = memories.flatMap((memory) => memory.photo_urls);
  const { data: signedUrls } = allPaths.length
    ? await supabase.storage
        .from("memory-photos")
        .createSignedUrls(allPaths, 3600)
    : { data: [] };

  const urlByPath = new Map(
    (signedUrls ?? []).map((entry) => [entry.path, entry.signedUrl])
  );

  const [y, m, d] = date.split("-").map(Number);

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
        <BackButton fallbackHref="/timeline" />
        <h1 className="flex items-center gap-2 text-lg font-medium">
          {String(y).padStart(4, "0")}.{String(m).padStart(2, "0")}.
          {String(d).padStart(2, "0")}
          <BooksIcon />
        </h1>
      </div>

      <div className="space-y-4 p-4">
        {memories.map((memory) => {
          const companionParts = formatCompanionParts(memory.companion);
          return (
            <div
              key={memory.id}
              className="rounded-xl border border-primary bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-base font-semibold"
                  style={{ color: MARK_COLOR }}
                >
                  {memory.places?.name}
                </span>
                <MemoryCardMenu memoryId={memory.id} />
              </div>
              {companionParts && (
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {companionParts.who}
                  </span>{" "}
                  {companionParts.rest}
                </p>
              )}
              {memory.photo_urls.length > 0 && (
                <PhotoGallery
                  className="mt-4 flex gap-2 overflow-x-auto"
                  photos={memory.photo_urls
                    .map((path) => ({ path, url: urlByPath.get(path) }))
                    .filter(
                      (p): p is { path: string; url: string } => !!p.url
                    )}
                />
              )}
              {memory.comment && (
                <p className="mt-7 text-sm font-medium">{memory.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
