import { signOut } from "./login/actions";

export default function Home() {
  return (
    <div>
      지도 홈
      <form action={signOut}>
        <button type="submit">로그아웃</button>
      </form>
    </div>
  );
}
