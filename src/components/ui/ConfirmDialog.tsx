"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export function ConfirmDialog({
  open,
  title,
  confirmText = "확인",
  cancelText = "취소",
  danger = false,
  // "sheet"는 뒤 화면(지도 위 핀 등)을 계속 보여줘야 할 때 쓰는 하단 바텀시트 형태.
  variant = "center",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  variant?: "center" | "sheet";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const isSheet = variant === "sheet";

  return createPortal(
    <div
      style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0 }}
      className={`z-50 flex ${
        isSheet
          ? "items-end bg-black/20"
          : "items-center bg-black/40 px-8 backdrop-blur-sm"
      }`}
      onClick={onCancel}
    >
      <div
        className={
          isSheet
            ? "w-full rounded-t-2xl bg-white p-5 pb-6"
            : "w-full max-w-xs rounded-2xl bg-white p-5"
        }
        onClick={(e) => e.stopPropagation()}
      >
        {isSheet && (
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
        )}
        <p className="text-center text-base font-medium">{title}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-border-dark py-2.5 text-sm font-medium text-gray-700"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium ${
              danger ? "bg-red-600 text-white" : "bg-primary text-black"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
