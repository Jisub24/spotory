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
      className="-m-2 p-2 text-gray-500"
    >
      ←
    </button>
  );
}
