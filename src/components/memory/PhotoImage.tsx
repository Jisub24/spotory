"use client";

import { useState } from "react";

// 사진이 실제로 다 로드되기 전까지는 같은 크기의 연한 회색 박스를 먼저 보여주고,
// 로드가 끝나면 자연스럽게 페이드로 바뀐다. (지도 스타일 로딩 때와 같은 방식)
export function PhotoImage({
  src,
  className,
}: {
  src: string;
  className: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg bg-gray-200 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
