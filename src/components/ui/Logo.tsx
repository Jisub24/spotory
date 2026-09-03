import { Fredoka } from "next/font/google";
import { MARK_COLOR } from "@/lib/theme";

// "Spotory"의 o 하나를 지도 마커 핀 모양으로 바꾼 워드마크 로고.
const fredoka = Fredoka({ subsets: ["latin"], weight: ["600"] });

export function Logo({ className = "text-3xl" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center text-gray-700 ${fredoka.className} ${className}`}
    >
      Sp
      <svg
        viewBox="0 0 24 32"
        className="mx-[0.02em] h-[0.85em] w-[0.65em] translate-y-[0.04em]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 1C6.477 1 2 5.477 2 11c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z"
          fill={MARK_COLOR}
        />
        <circle cx="12" cy="11" r="4.5" fill="white" />
      </svg>
      tory
    </span>
  );
}
