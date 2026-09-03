"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

const TAGLINE_WORDS = ["장소마다", "쌓이는", "나만의 이야기"];

type Phase = "checking" | "words" | "wordsExiting" | "brand";

export default function SplashPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 로그인된 사용자는 시작 화면을 거치지 않고 바로 홈으로 보낸다.
      if (user) {
        router.replace("/home");
      } else {
        setPhase("words");
      }
    })();
  }, [router]);

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
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-white px-8">
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
          <p className="text-sm text-gray-400">
            장소마다 쌓이는 나만의 이야기
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="entry-button-reveal mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-black"
          >
            나만의 이야기 만들기
          </button>
        </>
      )}
    </div>
  );
}
