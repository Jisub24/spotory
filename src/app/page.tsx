import { signOut } from "./login/actions";
import { KakaoMap } from "@/components/map/KakaoMap";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold">Spotory</span>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-gray-500 underline"
          >
            로그아웃
          </button>
        </form>
      </div>
      <div className="flex-1 p-4">
        <div className="h-full w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <KakaoMap />
        </div>
      </div>
    </div>
  );
}
