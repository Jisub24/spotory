"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteMemory } from "@/app/places/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function MemoryCardMenu({ memoryId }: { memoryId: string }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setOpen(false);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    startTransition(() => {
      deleteMemory(memoryId);
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
          <div className="absolute right-0 top-full z-20 w-max min-w-28 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <Link
              href={`/memories/${memoryId}/edit`}
              className="block whitespace-nowrap px-4 py-2 text-sm text-gray-700"
            >
              기록 수정
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="block w-full whitespace-nowrap px-4 py-2 text-left text-sm text-red-600 disabled:opacity-50"
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
