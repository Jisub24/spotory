"use client";

import { useEffect, useRef, useState } from "react";
import { MARK_COLOR } from "@/lib/theme";

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5; // 홀수여야 가운데 줄이 명확하게 생긴다.
const PADDING = (ITEM_HEIGHT * (VISIBLE_COUNT - 1)) / 2;

function WheelColumn({
  values,
  selectedIndex,
  onChangeIndex,
}: {
  values: string[];
  selectedIndex: number;
  onChangeIndex: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
    // 처음 열릴 때 현재 값 위치로만 맞추면 되고, 이후엔 스크롤이 곧 선택이라 재동기화하지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (!ref.current) return;
    const index = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
    onChangeIndex(Math.max(0, Math.min(values.length - 1, index)));
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="no-scrollbar w-24 snap-y snap-mandatory overflow-y-scroll"
      style={{ height: ITEM_HEIGHT * VISIBLE_COUNT }}
    >
      <div style={{ height: PADDING }} />
      {values.map((v, i) => (
        <div
          key={v}
          className={`flex snap-center items-center justify-center text-lg ${
            i === selectedIndex ? "text-black" : "text-gray-300"
          }`}
          style={{ height: ITEM_HEIGHT }}
        >
          {v}
        </div>
      ))}
      <div style={{ height: PADDING }} />
    </div>
  );
}

export function YearMonthPicker({
  year,
  month,
  onSelect,
  onClose,
}: {
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}) {
  const currentYear = new Date().getFullYear();
  // 넉넉하게 최근 20년 범위를 보여준다. 기록이 있는 연도로만 제한하지 않는다.
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 20 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [yearIndex, setYearIndex] = useState(Math.max(0, years.indexOf(year)));
  const [monthIndex, setMonthIndex] = useState(
    Math.max(0, months.indexOf(month))
  );

  return (
    <div
      className="fixed inset-0 z-30 flex items-end bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-white pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-300" />

        <div className="relative mt-4 flex justify-center">
          <div
            className="pointer-events-none absolute inset-x-6 rounded-full"
            style={{
              top: PADDING,
              height: ITEM_HEIGHT,
              backgroundColor: `${MARK_COLOR}33`,
            }}
          />
          <WheelColumn
            values={years.map((y) => `${y}년`)}
            selectedIndex={yearIndex}
            onChangeIndex={setYearIndex}
          />
          <WheelColumn
            values={months.map((m) => `${m}월`)}
            selectedIndex={monthIndex}
            onChangeIndex={setMonthIndex}
          />
        </div>

        <div className="px-6 pt-4">
          <button
            type="button"
            onClick={() => onSelect(years[yearIndex], months[monthIndex])}
            className="w-full rounded-full bg-primary px-3 py-3 text-black"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
