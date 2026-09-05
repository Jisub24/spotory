export default function Loading() {
  return (
    <div className="min-h-dvh animate-pulse bg-page">
      <div className="flex items-center bg-white px-6 py-4">
        <div className="h-9 w-9 rounded-full bg-gray-200" />
      </div>

      <div className="space-y-3 p-4">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-20 w-20 rounded bg-gray-200" />
          <div className="h-20 w-20 rounded bg-gray-200" />
        </div>
        <div className="h-12 w-full rounded bg-gray-200" />
        <div className="h-24 w-full rounded bg-gray-200" />
        <div className="h-12 w-full rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
