import Link from "next/link";
import { signOut } from "../login/actions";
import { Logo } from "@/components/ui/Logo";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col bg-page">
      <div className="flex items-center justify-between bg-white px-6 py-4">
        <Logo className="text-lg" />
        <form action={signOut}>
          <button
            type="submit"
            className="-m-2 p-2 text-sm text-gray-500 underline"
          >
            로그아웃
          </button>
        </form>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <Link
          href="/map"
          className="w-full max-w-sm rounded-full bg-primary px-6 py-4 text-center text-black"
        >
          기록 남기기
        </Link>
        <Link
          href="/timeline"
          className="w-full max-w-sm rounded-full border border-gray-300 px-6 py-4 text-center text-gray-700"
        >
          나의 기록 보기
        </Link>
      </div>
    </div>
  );
}
