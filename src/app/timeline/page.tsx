"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MonthCalendar } from "@/components/timeline/MonthCalendar";
import { TopPlaces } from "@/components/timeline/TopPlaces";
import { BackButton } from "@/components/ui/BackButton";

export default function TimelinePage() {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [markedDays, setMarkedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    const supabase = createClient();

    const monthStart = `${viewYear}-${String(viewMonth).padStart(2, "0")}-01`;
    const next =
      viewMonth === 12
        ? { y: viewYear + 1, m: 1 }
        : { y: viewYear, m: viewMonth + 1 };
    const monthEnd = `${next.y}-${String(next.m).padStart(2, "0")}-01`;

    supabase
      .from("memories")
      .select("memory_date")
      .gte("memory_date", monthStart)
      .lt("memory_date", monthEnd)
      .then(({ data }) => {
        setMarkedDays(
          new Set(
            ((data as { memory_date: string }[]) ?? []).map((row) =>
              Number(row.memory_date.slice(8, 10))
            )
          )
        );
      });
  }, [viewYear, viewMonth]);

  const goToDay = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    router.push(`/timeline/${dateStr}`);
  };

  return (
    <div className="min-h-dvh bg-page">
      <div className="flex items-center gap-3 bg-white px-6 py-4">
        <BackButton fallbackHref="/home" />
        <h1 className="text-lg font-semibold">나의 기록</h1>
      </div>

      <div className="space-y-6 p-4">
        <TopPlaces />

        <MonthCalendar
          year={viewYear}
          month={viewMonth}
          markedDays={markedDays}
          onSelectDay={goToDay}
          onChangeMonth={(y, m) => {
            // 연/월 피커로 미래 달을 고를 수도 있어서, 여기서도 한 번 더 막는다.
            const isFuture =
              y > now.getFullYear() ||
              (y === now.getFullYear() && m > now.getMonth() + 1);
            setViewYear(isFuture ? now.getFullYear() : y);
            setViewMonth(isFuture ? now.getMonth() + 1 : m);
          }}
        />
      </div>
    </div>
  );
}
