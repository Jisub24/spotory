"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MemoryActionState = {
  error: string | null;
  success?: boolean;
  placeId?: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// 원본 파일명(한글 등)을 그대로 쓰면 Supabase Storage가 "Invalid key"로 거부할 수 있어
// UUID만 쓴다. 모바일 네트워크 순단에 대비해 실패 시 한 번 더 시도한다.
async function uploadPhoto(
  supabase: SupabaseServerClient,
  userId: string,
  photo: File
): Promise<string | null> {
  const path = `${userId}/${crypto.randomUUID()}.jpg`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const { error } = await supabase.storage
      .from("memory-photos")
      .upload(path, photo);
    if (!error) return path;

    console.error(`사진 업로드 실패 (시도 ${attempt}/2):`, error);
    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return null;
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
    const path = await uploadPhoto(supabase, user.id, photo);
    if (!path) {
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
  revalidatePath(`/places/${placeId}`);
  return { error: null, success: true, placeId: placeId ?? undefined };
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

  // 빠진 사진 경로만 미리 파악해두고, 실제 삭제는 DB 업데이트 성공 후에 한다.
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
    const path = await uploadPhoto(supabase, user.id, photo);
    if (!path) {
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
  return { error: null, success: true };
}

export async function deleteMemory(
  memoryId: string
): Promise<{ placeDeleted: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { placeDeleted: false };

  const { data: memory } = await supabase
    .from("memories")
    .select("place_id, photo_urls")
    .eq("id", memoryId)
    .single();

  if (!memory) return { placeDeleted: false };

  if (memory.photo_urls.length > 0) {
    await supabase.storage.from("memory-photos").remove(memory.photo_urls);
  }

  await supabase.from("memories").delete().eq("id", memoryId);

  const { count } = await supabase
    .from("memories")
    .select("id", { count: "exact", head: true })
    .eq("place_id", memory.place_id);

  if (!count) {
    await supabase.from("places").delete().eq("id", memory.place_id);
    revalidatePath("/map");
    return { placeDeleted: true };
  }

  revalidatePath(`/places/${memory.place_id}`);
  return { placeDeleted: false };
}
