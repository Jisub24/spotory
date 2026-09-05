"use client";

import { useRouter } from "next/navigation";

export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        // 브라우저 히스토리가 없는 상태(새 탭으로 바로 열린 경우 등)를 대비해 폴백을 둔다.
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="press-fade text-primary -m-2 flex h-9 w-9 items-center justify-center p-2"
    >
      {/* 글자(폰트) 대신 도형으로 그려서, 폰트마다 다른 글자 높이 기준선 때문에
          제목 글씨와 위/아래가 어긋나는 걸 막는다. */}
      <svg
        width="10"
        height="18"
        viewBox="0 0 10 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 1L1 9L9 17"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
