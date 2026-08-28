"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { createMemory, type MemoryActionState } from "@/app/places/actions";

const initialState: MemoryActionState = { error: null };

type NewPlaceInfo = {
  name: string;
  lat: number;
  lng: number;
  googlePlaceId: string;
};

const COMPANION_TYPES = ["혼자", "가족", "연인", "친구"] as const;
type CompanionType = (typeof COMPANION_TYPES)[number];

const MAX_PHOTOS = 10;

export function MemoryForm({
  placeId,
  newPlace,
}: {
  placeId?: string;
  newPlace?: NewPlaceInfo;
}) {
  const [state, formAction, pending] = useActionState(
    createMemory,
    initialState
  );
  // 날짜 입력의 기본값을 오늘로 미리 채워서, 매번 날짜를 직접 고르지 않아도 되게 한다.
  const today = new Date().toISOString().slice(0, 10);
  // 네이티브 date input의 표시 형식은 기기 로캘을 따라가서 우리 마음대로 못 바꾸기 때문에,
  // 실제 input은 투명하게 깔아두고 그 위에 원하는 형식(YYYY.MM.DD)으로 직접 렌더링한다.
  const [date, setDate] = useState(today);

  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 실제 제출에 쓰이는 input은 숨겨두고, 탭할 때마다 새로 고른 파일을
  // 누적된 목록에 이어붙인 뒤 DataTransfer로 그 input의 FileList를 다시 채운다.
  useEffect(() => {
    const dataTransfer = new DataTransfer();
    photos.forEach((photo) => dataTransfer.items.add(photo));
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
  }, [photos]);

  const handlePickPhotos = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > 0) {
      setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
    }
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const [comment, setComment] = useState("");

  const [companionType, setCompanionType] = useState<CompanionType | null>(
    "혼자"
  );
  const [friendNames, setFriendNames] = useState("");

  const companionValue =
    companionType === "친구"
      ? friendNames.trim()
        ? `친구 (${friendNames.trim()})`
        : "친구"
      : (companionType ?? "");

  return (
    <form action={formAction} className="space-y-3 p-4">
      {placeId && <input type="hidden" name="placeId" value={placeId} />}
      {newPlace && (
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

      <h1 className="text-lg font-semibold">{newPlace?.name ?? "새 기록"}</h1>

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
          disabled={photos.length >= MAX_PHOTOS}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded border border-dashed border-gray-300 text-gray-400 disabled:opacity-50"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </button>
        {photos.map((photo, i) => (
          <PhotoThumb key={i} file={photo} onRemove={() => removePhoto(i)} />
        ))}
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
                  ? "border-black bg-black text-white"
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

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button
        type="submit"
        disabled={pending || (photos.length === 0 && comment.trim() === "")}
        className="w-full rounded-full bg-black px-3 py-3 text-white disabled:opacity-50"
      >
        {pending ? "쌓는 중..." : "기록 남기기"}
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
