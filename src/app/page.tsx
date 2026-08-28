import Link from "next/link";
import { signOut } from "./login/actions";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold">Spotory</span>
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
          className="w-full max-w-sm rounded-full bg-black px-6 py-4 text-center text-white"
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
