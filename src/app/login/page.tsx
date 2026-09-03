"use client";

import { useActionState, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { signIn, signUp, type AuthActionState } from "./actions";

const initialState: AuthActionState = { error: null, message: null };

export default function LoginPage() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* mode가 바뀔 때마다 key로 완전히 새로 마운트해서 이전 제출 결과(state)가 남지 않게 함 */}
        <AuthForm key={mode} mode={mode} />

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {mode === "signIn" ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
          </span>
          <button
            type="button"
            onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
            className="-m-2 p-2 font-medium underline"
          >
            {mode === "signIn" ? "회원가입" : "로그인"}
          </button>
        </div>
      </div>
    </main>
  );
}

function AuthForm({ mode }: { mode: "signIn" | "signUp" }) {
  const [state, formAction, pending] = useActionState(
    mode === "signIn" ? signIn : signUp,
    initialState
  );
  const [clientError, setClientError] = useState<string | null>(null);

  // Supabase 서버까지 요청을 보내지 않고, 빈 값처럼 뻔한 실수는 여기서 먼저 걸러서
  // "이메일을 입력해주세요" 같은 구체적인 안내를 즉시 보여준다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = formData.get("password") as string;

    if (!email) {
      event.preventDefault();
      setClientError("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      event.preventDefault();
      setClientError("비밀번호를 입력해주세요.");
      return;
    }
    setClientError(null);
  }

  const errorToShow = clientError ?? state.error;

  return (
    <>
      <h1 className="text-xl font-semibold">
        {mode === "signIn" ? "로그인" : "회원가입"}
      </h1>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-3"
      >
        <input
          type="email"
          name="email"
          placeholder="이메일"
          className="w-full rounded border border-border-dark px-3 py-3"
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          className="w-full rounded border border-border-dark px-3 py-3"
        />

        {errorToShow && <p className="text-sm text-red-600">{errorToShow}</p>}
        {state.message && (
          <p className="text-sm text-green-600">{state.message}</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-primary px-3 py-3 text-black disabled:opacity-50"
        >
          {mode === "signIn" ? "로그인" : "회원가입"}
        </Button>
      </form>
    </>
  );
}
