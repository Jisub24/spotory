import type { AuthError } from "@supabase/supabase-js";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  email_address_invalid: "이메일 주소가 유효하지 않습니다.",
  email_not_confirmed: "이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.",
  user_already_exists: "이미 가입된 이메일입니다.",
  weak_password: "비밀번호가 너무 약합니다. 6자 이상 입력해주세요.",
  over_email_send_rate_limit:
    "이메일 발송 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  signup_disabled: "현재 회원가입을 받고 있지 않습니다.",
};

const DEFAULT_MESSAGE = "요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

export function translateAuthError(error: AuthError): string {
  return (error.code && MESSAGES[error.code]) || DEFAULT_MESSAGE;
}
