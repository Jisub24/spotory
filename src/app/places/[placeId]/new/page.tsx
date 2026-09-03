import { MemoryForm } from "@/components/memory/MemoryForm";
import { BackButton } from "@/components/ui/BackButton";

export default async function NewMemoryPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;
  return (
    <div className="min-h-dvh bg-gray-50 animate-page-enter">
      <div className="flex items-center gap-3 bg-white px-6 py-4 shadow-sm">
        <BackButton fallbackHref={`/places/${placeId}`} />
        <h1 className="text-lg font-semibold">이야기 쌓기</h1>
      </div>
      <MemoryForm placeId={placeId} />
    </div>
  );
}
