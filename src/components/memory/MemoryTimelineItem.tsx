"use client";

import { useState } from "react";
import { MemoryCardMenu } from "@/components/memory/MemoryCardMenu";
import { PhotoGallery } from "@/components/memory/PhotoGallery";
import { formatCompanionParts } from "@/lib/format/companion";

export function MemoryTimelineItem({
  memory,
  ordinal,
  photos,
}: {
  memory: {
    id: string;
    photo_urls: string[];
    comment: string | null;
    memory_date: string;
    companion: string | null;
  };
  ordinal: number;
  photos: { path: string; url: string }[];
}) {
  const [open, setOpen] = useState(true);
  const companionParts = formatCompanionParts(memory.companion);

  return (
    <div className={`relative pl-6 ${open ? "" : "pb-21"}`}>
      <div className="absolute top-1.5 left-0 h-2 w-2 rounded-full bg-accent-text" />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`mb-1.5 font-medium text-gray-700 ${
          open ? "text-sm" : "text-base"
        }`}
      >
        {ordinal}번째 기록
      </button>
      {open && (
        <div className="rounded-xl bg-card p-4 shadow-[4px_4px_10px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between text-sm text-meta">
            <span className="inline-flex items-center gap-1">
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-accent-text"
              >
                <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {memory.memory_date.slice(0, 10).replace(/-/g, ".")}
              {companionParts && (
                <>
                  {" "}
                  <span className="font-semibold text-meta">
                    {companionParts.who}
                  </span>{" "}
                  {companionParts.rest}
                </>
              )}
            </span>
            <MemoryCardMenu memoryId={memory.id} />
          </div>
          {memory.comment && (
            <p className="mt-5 text-sm font-medium text-body">
              {memory.comment}
            </p>
          )}
          {photos.length > 0 && (
            <PhotoGallery
              className="mt-5 flex gap-2 overflow-x-auto"
              photos={photos}
            />
          )}
        </div>
      )}
    </div>
  );
}
