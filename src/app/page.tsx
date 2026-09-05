"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const TAGLINE_WORDS = ["장소마다", "쌓이는", "나만의 이야기"];

type Phase = "words" | "wordsExiting" | "brand";

export default function SplashPage() {
  const router = useRouter();
  // 이미 로그인한 사용자는 proxy.ts가 서버 단에서 바로 /home으로 보내기 때문에,
  // 이 페이지가 실제로 렌더링되는 건 항상 로그아웃 상태일 때뿐이다.
  const [phase, setPhase] = useState<Phase>("words");

  useEffect(() => {
    if (phase !== "words") return;
    const timer = setTimeout(() => setPhase("wordsExiting"), 3050);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "wordsExiting") return;
    const timer = setTimeout(() => setPhase("brand"), 300);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div
      className="flex h-dvh flex-col items-center justify-center gap-4 px-8"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage:
          "radial-gradient(circle at 50% 35%, rgba(167,181,216,0.22), rgba(255,255,255,0) 60%)",
      }}
    >
      {(phase === "words" || phase === "wordsExiting") && (
        <div
          className={`flex flex-col items-center gap-2 ${
            phase === "wordsExiting" ? "animate-fade-out" : ""
          }`}
        >
          {TAGLINE_WORDS.map((word, i) => (
            <p
              key={word}
              className="tagline-reveal-slow text-2xl font-semibold text-gray-800"
              style={{ animationDelay: `${i * 600}ms` }}
            >
              {word}
            </p>
          ))}
        </div>
      )}

      {phase === "brand" && (
        <>
          <Logo className="tagline-reveal text-3xl" />
          <p className="text-base font-medium text-gray-600">
            장소마다 쌓이는 나만의 이야기
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="entry-button-reveal mt-8 flex items-center gap-1.5 rounded-full bg-linear-to-b from-primary to-[#8fa0c9] px-6 py-3 text-sm font-medium text-black shadow-[0_8px_20px_rgba(167,181,216,0.5)]"
          >
            나만의 이야기 만들기
            <svg
              aria-hidden
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M1 8H15M15 8L11 4M15 8L11 12"
                stroke="black"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
