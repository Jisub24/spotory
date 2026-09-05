export default function Loading() {
  return (
    <div className="min-h-dvh animate-pulse bg-page">
      <div className="flex items-center gap-3 bg-white px-6 py-4">
        <div className="h-9 w-9 rounded-full bg-gray-200" />
        <div className="h-5 w-32 rounded bg-gray-200" />
      </div>

      <div className="space-y-4 p-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="mt-4 flex gap-2">
              <div className="h-28 w-28 shrink-0 rounded-lg bg-gray-200" />
              <div className="h-28 w-28 shrink-0 rounded-lg bg-gray-200" />
            </div>
            <div className="mt-6 h-4 w-3/4 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
