"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMemory } from "@/app/places/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function MemoryCardMenu({
  memoryId,
  isLastOnPage = false,
  fallbackHref = "/map",
}: {
  memoryId: string;
  isLastOnPage?: boolean;
  fallbackHref?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    startTransition(async () => {
      const { placeDeleted } = await deleteMemory(memoryId);
      // 현재 페이지가 이 기록을 마지막으로 보여주고 있었으면(장소 자체가
      // 삭제됐거나, 이 페이지의 목록이 이걸로 비게 되거나) 화면에 남을 게
      // 없으니 이전 페이지로 돌아간다. 히스토리가 없으면 fallback으로 보낸다.
      if (placeDeleted || isLastOnPage) {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="기록 메뉴"
        className="-m-2 p-2 text-2xl font-bold leading-none text-gray-600"
      >
        ⋮
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-max min-w-28 divide-y divide-gray-100 overflow-hidden rounded-xl border border-primary/40 bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.12)]">
            <Link
              href={`/memories/${memoryId}/edit`}
              className="block whitespace-nowrap px-4 py-2.5 text-sm text-gray-700"
            >
              기록 수정
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="block w-full whitespace-nowrap px-4 py-2.5 text-left text-sm text-red-600 disabled:opacity-50"
            >
              기록 삭제
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="기록을 삭제하시겠습니까?"
        confirmText="삭제"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
