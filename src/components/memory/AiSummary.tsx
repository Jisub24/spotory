"use client";

import { useEffect, useRef, useState } from "react";

export function AiSummary({
  placeId,
  placeName,
  initialSummary,
  needsRefresh,
}: {
  placeId: string;
  placeName: string;
  initialSummary: string | null;
  needsRefresh: boolean;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(needsRefresh);
  const [open, setOpen] = useState(true);
  // 개발 모드(Strict Mode)에서 effect가 두 번 실행되면서 요청도 두 번 나가던 걸 막는다.
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!needsRefresh) return;
    if (requestedRef.current) return;
    requestedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeId }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { summary: string };
        if (!cancelled) setSummary(data.summary);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  if (!summary && !loading) return null;

  return (
    <div className="rounded-xl border border-primary bg-summary p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="press-fade text-primary flex w-full items-center justify-between"
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-text">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          {placeName}에서의 이야기
        </span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open &&
        (summary ? (
          <p className="animate-page-enter mt-2 text-sm leading-relaxed text-body">
            {summary}
          </p>
        ) : (
          <div className="mt-2 animate-pulse space-y-2">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-5/6 rounded bg-gray-200" />
            <div className="h-3 w-3/4 rounded bg-gray-200" />
          </div>
        ))}
    </div>
  );
}
