"use client";

import { useState } from "react";
import { YearMonthPicker } from "./YearMonthPicker";
import { MARK_COLOR } from "@/lib/theme";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function MonthCalendar({
  year,
  month,
  markedDays,
  onSelectDay,
  onChangeMonth,
}: {
  year: number;
  month: number;
  markedDays: Set<number>;
  onSelectDay: (day: number) => void;
  onChangeMonth: (year: number, month: number) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  const goToPrevMonth = () => {
    if (month === 1) onChangeMonth(year - 1, 12);
    else onChangeMonth(year, month - 1);
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;
    if (month === 12) onChangeMonth(year + 1, 1);
    else onChangeMonth(year, month + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 text-base font-semibold"
        >
          {year}년 {month}월
          <svg
            width="7"
            height="12"
            viewBox="0 0 7 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 ${
              pickerOpen ? "rotate-90" : "rotate-0"
            }`}
          >
            <path
              d="M1 1L6 6L1 11"
              stroke={MARK_COLOR}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="이전 달"
            className="-m-2 flex h-8 w-8 items-center justify-center p-2 text-2xl leading-none"
            style={{ color: MARK_COLOR }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="다음 달"
            disabled={isCurrentMonth}
            className="-m-2 flex h-8 w-8 items-center justify-center p-2 text-2xl leading-none disabled:cursor-default"
            style={{ color: isCurrentMonth ? "#d1d5db" : MARK_COLOR }}
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-xs text-gray-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const marked = markedDays.has(day);
          return (
            <button
              key={day}
              type="button"
              disabled={!marked}
              onClick={() => onSelectDay(day)}
              className="flex flex-col items-center gap-1 py-2 disabled:cursor-default"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-gray-800">
                {day}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: marked ? MARK_COLOR : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      {pickerOpen && (
        <YearMonthPicker
          year={year}
          month={month}
          onSelect={(y, m) => {
            onChangeMonth(y, m);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
