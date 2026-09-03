import { MemoryForm } from "@/components/memory/MemoryForm";
import { BackButton } from "@/components/ui/BackButton";

export default async function NewPlaceMemoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    lat?: string;
    lng?: string;
    googlePlaceId?: string;
  }>;
}) {
  const { name, lat, lng, googlePlaceId } = await searchParams;

  if (!name || !lat || !lng || !googlePlaceId) {
    return (
      <div className="p-4 text-sm text-gray-500">잘못된 접근입니다.</div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50 animate-page-enter">
      <div className="flex items-center bg-white px-6 py-4 shadow-sm">
        <BackButton fallbackHref="/map" />
      </div>
      <MemoryForm
        newPlace={{ name, lat: Number(lat), lng: Number(lng), googlePlaceId }}
      />
    </div>
  );
}
