"use server";

import { redirect, RedirectType } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MemoryActionState = {
  error: string | null;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// 모바일 네트워크에서 업로드가 순간적으로 끊기는 경우가 있어, 실패하면 한 번 더 시도한다.
// 실패 원인을 서버 로그에 남겨서 계속 실패할 때 원인을 알 수 있게 한다.
async function uploadPhoto(
  supabase: SupabaseServerClient,
  path: string,
  photo: File
): Promise<boolean> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { error } = await supabase.storage
      .from("memory-photos")
      .upload(path, photo);
    if (!error) return true;

    console.error(`사진 업로드 실패 (시도 ${attempt}/2):`, error);
    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

export async function createMemory(
  _prevState: MemoryActionState,
  formData: FormData
): Promise<MemoryActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const comment = ((formData.get("comment") as string) ?? "").trim();
  const hasPhoto = formData
    .getAll("photos")
    .some((file) => file instanceof File && file.size > 0);

  if (!hasPhoto && !comment) {
    return { error: "사진이나 코멘트 중 하나는 입력해주세요." };
  }

  let placeId = formData.get("placeId") as string | null;

  // placeId가 없으면 검색에서 바로 넘어온, 아직 우리 DB엔 없는 장소다.
  // (created_by, google_place_id) 유니크 제약을 이용해 upsert하면
  // 이미 저장된 장소면 그 행을 그대로 재사용하고, 없으면 새로 만든다.
  if (!placeId) {
    const googlePlaceId = formData.get("googlePlaceId") as string;
    const name = formData.get("name") as string;
    const lat = Number(formData.get("lat"));
    const lng = Number(formData.get("lng"));

    const { data: place, error: placeError } = await supabase
      .from("places")
      .upsert(
        { name, lat, lng, google_place_id: googlePlaceId, created_by: user.id },
        { onConflict: "created_by,google_place_id" }
      )
      .select("id")
      .single();

    if (placeError || !place) {
      return { error: "장소를 저장하지 못했습니다." };
    }
    placeId = place.id;
  }

  const photos = formData
    .getAll("photos")
    .filter((file): file is File => file instanceof File && file.size > 0);

  const photoPaths: string[] = [];
  for (const photo of photos) {
    // 원본 파일명(한글 등)을 그대로 저장 경로에 쓰면 Supabase Storage가
    // "Invalid key"로 거부하는 경우가 있어서, 파일명 없이 UUID만 쓴다.
    // (compressImage가 항상 JPEG로 변환하므로 확장자는 고정해도 된다.)
    const path = `${user.id}/${crypto.randomUUID()}.jpg`;
    const uploaded = await uploadPhoto(supabase, path, photo);

    if (!uploaded) {
      return { error: "사진 업로드에 실패했습니다." };
    }
    photoPaths.push(path);
  }

  const memoryDate = formData.get("memoryDate") as string;
  const companion = (formData.get("companion") as string) || null;

  const { error: memoryError } = await supabase.from("memories").insert({
    place_id: placeId,
    user_id: user.id,
    photo_urls: photoPaths,
    comment: comment || null,
    memory_date: new Date(memoryDate).toISOString(),
    companion,
  });

  if (memoryError) {
    return { error: "기록을 저장하지 못했습니다." };
  }

  revalidatePath("/home");
  redirect(`/places/${placeId}`, RedirectType.replace);
}

export async function updateMemory(
  _prevState: MemoryActionState,
  formData: FormData
): Promise<MemoryActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const memoryId = formData.get("memoryId") as string;
  const placeId = formData.get("placeId") as string;
  const comment = ((formData.get("comment") as string) ?? "").trim();
  const keptPaths = formData.getAll("existingPhotoPaths") as string[];
  const newPhotos = formData
    .getAll("photos")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (keptPaths.length === 0 && newPhotos.length === 0 && !comment) {
    return { error: "사진이나 코멘트 중 하나는 입력해주세요." };
  }

  // 원래 있던 사진 중 이번에 빠진(더 이상 keptPaths에 없는) 것들의 경로만 미리 파악해둔다.
  // 실제 삭제는 DB 업데이트가 성공한 뒤에 한다 — 순서를 바꾸면, 새 사진 업로드가
  // 실패해서 이 요청이 통째로 취소돼도 이미 지워버린 사진이 DB에는 여전히 남아있는 걸로
  // 나오는 깨진 상태가 생긴다.
  const { data: existingMemory } = await supabase
    .from("memories")
    .select("photo_urls")
    .eq("id", memoryId)
    .single();

  const removedPaths = (existingMemory?.photo_urls ?? []).filter(
    (path: string) => !keptPaths.includes(path)
  );

  const newPaths: string[] = [];
  for (const photo of newPhotos) {
    // 원본 파일명(한글 등)을 그대로 저장 경로에 쓰면 Supabase Storage가
    // "Invalid key"로 거부하는 경우가 있어서, 파일명 없이 UUID만 쓴다.
    // (compressImage가 항상 JPEG로 변환하므로 확장자는 고정해도 된다.)
    const path = `${user.id}/${crypto.randomUUID()}.jpg`;
    const uploaded = await uploadPhoto(supabase, path, photo);

    if (!uploaded) {
      return { error: "사진 업로드에 실패했습니다." };
    }
    newPaths.push(path);
  }

  const memoryDate = formData.get("memoryDate") as string;
  const companion = (formData.get("companion") as string) || null;

  const { error: updateError } = await supabase
    .from("memories")
    .update({
      photo_urls: [...keptPaths, ...newPaths],
      comment: comment || null,
      memory_date: new Date(memoryDate).toISOString(),
      companion,
    })
    .eq("id", memoryId);

  if (updateError) {
    return { error: "기록을 수정하지 못했습니다." };
  }

  if (removedPaths.length > 0) {
    await supabase.storage.from("memory-photos").remove(removedPaths);
  }

  revalidatePath(`/places/${placeId}`);
  redirect(`/places/${placeId}`, RedirectType.replace);
}

export async function deleteMemory(memoryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: memory } = await supabase
    .from("memories")
    .select("place_id, photo_urls")
    .eq("id", memoryId)
    .single();

  if (!memory) return;

  if (memory.photo_urls.length > 0) {
    await supabase.storage.from("memory-photos").remove(memory.photo_urls);
  }

  await supabase.from("memories").delete().eq("id", memoryId);

  revalidatePath(`/places/${memory.place_id}`);
}
