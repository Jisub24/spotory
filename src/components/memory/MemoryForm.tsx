"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  createMemory,
  updateMemory,
  type MemoryActionState,
} from "@/app/places/actions";
import { compressImage } from "@/lib/image/compressImage";

const initialState: MemoryActionState = { error: null };

type NewPlaceInfo = {
  name: string;
  lat: number;
  lng: number;
  googlePlaceId: string;
};

type ExistingMemory = {
  id: string;
  placeId: string;
  photos: { path: string; url: string }[];
  comment: string;
  memoryDate: string;
  companion: string | null;
};

const COMPANION_TYPES = ["혼자", "가족", "연인", "친구"] as const;
type CompanionType = (typeof COMPANION_TYPES)[number];

// "친구 (철수, 민지)" 같은 저장 형식을 다시 선택 상태로 되돌린다. (수정 모드 초기값용)
function parseCompanion(value: string | null): {
  type: CompanionType | null;
  friendNames: string;
} {
  if (!value) return { type: null, friendNames: "" };
  const friendMatch = value.match(/^친구(?: \((.+)\))?$/);
  if (friendMatch) return { type: "친구", friendNames: friendMatch[1] ?? "" };
  if ((COMPANION_TYPES as readonly string[]).includes(value)) {
    return { type: value as CompanionType, friendNames: "" };
  }
  return { type: null, friendNames: "" };
}

const MAX_PHOTOS = 10;
// next.config.ts의 serverActions.bodySizeLimit(20mb)보다 여유를 두고,
// 서버까지 보내서 실패하기 전에 미리 걸러낸다.
const MAX_TOTAL_PHOTO_SIZE = 19 * 1024 * 1024;

type PhotoItem =
  | { kind: "existing"; path: string; url: string }
  | { kind: "new"; file: File };

export function MemoryForm({
  placeId,
  newPlace,
  memory,
}: {
  placeId?: string;
  newPlace?: NewPlaceInfo;
  memory?: ExistingMemory;
}) {
  const [state, formAction, pending] = useActionState(
    memory ? updateMemory : createMemory,
    initialState
  );
  // 날짜 입력의 기본값을 오늘로 미리 채워서, 매번 날짜를 직접 고르지 않아도 되게 한다.
  const today = new Date().toISOString().slice(0, 10);
  // 네이티브 date input의 표시 형식은 기기 로캘을 따라가서 우리 마음대로 못 바꾸기 때문에,
  // 실제 input은 투명하게 깔아두고 그 위에 원하는 형식(YYYY.MM.DD)으로 직접 렌더링한다.
  const [date, setDate] = useState(memory?.memoryDate ?? today);

  // 수정 모드에선 이미 업로드된 사진과 새로 추가하는 사진이 같은 줄에 섞여서 표시/삭제된다.
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>(
    memory?.photos.map((p) => ({ kind: "existing" as const, ...p })) ?? []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 실제 제출에 쓰이는 input은 숨겨두고, 새로 고른 파일들만 DataTransfer로
  // 그 input의 FileList에 채운다. 기존 사진은 다시 업로드하지 않는다.
  // state도 의존성에 넣은 이유: 제출이 실패해도 브라우저가 파일 input의
  // FileList를 비워버리는 경우가 있어서, 재시도할 때 사진이 빠지는 버그가 있었다.
  // 제출 시도(성공/실패 모두)가 끝날 때마다 다시 채워 넣어서 이를 막는다.
  useEffect(() => {
    const dataTransfer = new DataTransfer();
    photoItems.forEach((item) => {
      if (item.kind === "new") dataTransfer.items.add(item.file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
  }, [photoItems, state]);

  const handlePickPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;

    const compressed = await Promise.all(
      picked.map((file) => compressImage(file))
    );
    setPhotoItems((prev) =>
      [...prev, ...compressed.map((file) => ({ kind: "new" as const, file }))].slice(
        0,
        MAX_PHOTOS
      )
    );
  };

  const removePhotoItem = (index: number) => {
    setPhotoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const [sizeError, setSizeError] = useState<string | null>(null);

  // 압축이 실패해서 원본이 그대로 남는 경우를 대비해, 서버에 보내기 전에
  // 새로 추가한 사진들의 총 용량을 한 번 더 확인한다. 여기서 걸러야
  // "Body exceeded" 같은 알아보기 힘든 에러 대신 바로 이해할 수 있는 메시지를 보여줄 수 있다.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const totalSize = photoItems.reduce(
      (sum, item) => (item.kind === "new" ? sum + item.file.size : sum),
      0
    );
    if (totalSize > MAX_TOTAL_PHOTO_SIZE) {
      e.preventDefault();
      setSizeError("사진 용량을 확인해주세요.");
      return;
    }
    setSizeError(null);
  };

  const [comment, setComment] = useState(memory?.comment ?? "");

  const initialCompanion = parseCompanion(memory?.companion ?? null);
  const [companionType, setCompanionType] = useState<CompanionType | null>(
    memory ? initialCompanion.type : "혼자"
  );
  const [friendNames, setFriendNames] = useState(initialCompanion.friendNames);

  const companionValue =
    companionType === "친구"
      ? friendNames.trim()
        ? `친구 (${friendNames.trim()})`
        : "친구"
      : (companionType ?? "");

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-3 p-4">
      {memory && (
        <>
          <input type="hidden" name="memoryId" value={memory.id} />
          <input type="hidden" name="placeId" value={memory.placeId} />
        </>
      )}
      {!memory && placeId && (
        <input type="hidden" name="placeId" value={placeId} />
      )}
      {!memory && newPlace && (
        <>
          <input type="hidden" name="name" value={newPlace.name} />
          <input type="hidden" name="lat" value={newPlace.lat} />
          <input type="hidden" name="lng" value={newPlace.lng} />
          <input
            type="hidden"
            name="googlePlaceId"
            value={newPlace.googlePlaceId}
          />
        </>
      )}

      <p className="text-sm font-medium">사진 등록</p>
      <input
        ref={fileInputRef}
        type="file"
        name="photos"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePickPhotos}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={photoItems.length >= MAX_PHOTOS}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded border border-dashed border-gray-300 text-gray-400 disabled:opacity-50"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs">
            {photoItems.length}/{MAX_PHOTOS}
          </span>
        </button>
        {photoItems.map((item, i) =>
          item.kind === "existing" ? (
            <div key={item.path} className="relative h-20 w-20 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                className="h-full w-full rounded object-cover"
              />
              <input
                type="hidden"
                name="existingPhotoPaths"
                value={item.path}
              />
              <button
                type="button"
                onClick={() => removePhotoItem(i)}
                aria-label="사진 삭제"
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-gray-600 shadow"
              >
                ✕
              </button>
            </div>
          ) : (
            <PhotoThumb
              key={i}
              file={item.file}
              onRemove={() => removePhotoItem(i)}
            />
          )
        )}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-300">
        <input
          type="date"
          name="memoryDate"
          value={date}
          onChange={(e) => setDate(e.target.value > today ? today : e.target.value)}
          max={today}
          required
          className="absolute inset-0 h-full w-full"
          style={{ opacity: 0, color: "transparent", background: "transparent" }}
        />
        <div className="pointer-events-none px-3 py-3 text-gray-500">
          {date.replace(/-/g, ".")}
        </div>
      </div>
      <textarea
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="이곳에서의 순간을 남겨보세요"
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-3 py-3"
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">함께한 사람</p>
        <div className="flex gap-2">
          {COMPANION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setCompanionType((prev) => (prev === type ? null : type))
              }
              className={`rounded-full border px-4 py-2 text-sm ${
                companionType === type
                  ? "border-primary bg-primary text-black"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {companionType === "친구" && (
          <input
            type="text"
            value={friendNames}
            onChange={(e) => setFriendNames(e.target.value)}
            placeholder="함께한 친구 이름"
            className="w-full rounded-lg border border-gray-300 px-3 py-3"
          />
        )}
      </div>
      <input type="hidden" name="companion" value={companionValue} />

      {(sizeError || state.error) && (
        <p className="text-sm text-red-600">{sizeError ?? state.error}</p>
      )}

      <Button
        type="submit"
        disabled={
          pending || (photoItems.length === 0 && comment.trim() === "")
        }
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-3 py-3 text-black disabled:opacity-50"
      >
        {pending && <Spinner />}
        {memory
          ? pending
            ? "수정 중"
            : "수정하기"
          : pending
            ? "쌓는 중"
            : "이야기 쌓기"}
      </Button>
    </form>
  );
}

function PhotoThumb({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="relative h-20 w-20 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full rounded object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="사진 삭제"
        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-gray-600 shadow"
      >
        ✕
      </button>
    </div>
  );
}
