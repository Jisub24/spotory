"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// 사진이 실제로 다 로드되기 전까지는 같은 크기의 연한 회색 박스를 먼저 보여주고,
// 로드가 끝나면 자연스럽게 페이드로 바뀐다. (지도 스타일 로딩 때와 같은 방식)
function Thumbnail({
  photo,
  index,
  onOpen,
}: {
  photo: { path: string; url: string };
  index: number;
  onOpen: (index: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt=""
        onClick={() => onOpen(index)}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full cursor-pointer object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export function PhotoGallery({
  photos,
  className = "mt-2 flex gap-2 overflow-x-auto",
}: {
  photos: { path: string; url: string }[];
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  // 열려있는 동안 배경 스크롤을 잠가서 뒤 화면이 움직이지 않게 한다.
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  return (
    <>
      <div className={className}>
        {photos.map((photo, i) => (
          <Thumbnail
            key={photo.path}
            photo={photo}
            index={i}
            onOpen={setOpenIndex}
          />
        ))}
      </div>

      {isOpen &&
        openIndex !== null &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
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
          </div>,
          document.body
        )}
    </>
  );
}
