import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession()이 아니라 getUser()를 쓰는 이유: getSession()은 쿠키에 담긴 값을
  // 그대로 신뢰하지만, getUser()는 Supabase Auth 서버에 다시 물어봐서 토큰이
  // 아직 유효한지 검증한다. 라우팅 가드처럼 보안이 걸린 판단에는 getUser()가 맞다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // "/"는 로그인 여부와 무관하게 항상 보여주는 시작 화면이라, "/"로 시작하는
  // 모든 경로가 아니라 정확히 "/"인 경우만 공개 경로로 취급한다.
  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 로그인 상태에서 "/"로 오면 클라이언트 JS를 기다리지 않고 서버에서 바로 보낸다.
  if (user && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image).*)"],
};
