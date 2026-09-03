"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      router.replace(user ? "/home" : "/login");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-2 bg-white">
      <span className="text-3xl font-bold">Spotory</span>
    </div>
  );
}
