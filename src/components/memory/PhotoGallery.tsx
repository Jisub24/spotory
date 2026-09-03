"use client";

import { useState } from "react";

export function PhotoGallery({
  photos,
  className = "mt-2 flex gap-2 overflow-x-auto",
}: {
  photos: { path: string; url: string }[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className={className}>
        {photos.map((photo, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo.path}
            src={photo.url}
            alt=""
            onClick={() => setOpenIndex(i)}
            className="h-28 w-28 shrink-0 cursor-pointer rounded-lg object-cover"
          />
        ))}
      </div>

      {openIndex !== null && (
        <div
          style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0 }}
          className="z-50 flex items-center justify-center bg-black/70 p-8 backdrop-blur-sm"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setOpenIndex(null)}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-xl text-white"
          >
            ✕
          </button>

          {openIndex > 0 && (
            <button
              type="button"
              aria-label="이전 사진"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex(openIndex - 1);
              }}
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50"
            >
              <svg
                width="11"
                height="19"
                viewBox="0 0 11 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.5 1L1.5 9.5L9.5 18"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[openIndex].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain"
          />

          {openIndex < photos.length - 1 && (
            <button
              type="button"
              aria-label="다음 사진"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex(openIndex + 1);
              }}
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/50"
            >
              <svg
                width="11"
                height="19"
                viewBox="0 0 11 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 1L9.5 9.5L1.5 18"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
