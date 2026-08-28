import { MemoryForm } from "@/components/memory/MemoryForm";

export default async function NewMemoryPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;
  return <MemoryForm placeId={placeId} />;
}
