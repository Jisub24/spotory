import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { formatCompanionParts } from "@/lib/format/companion";

const openai = new OpenAI();

// 요약에 넣을 사진은 기록당 최대 이만큼만 (비용/속도 때문에 전부 다 보내진 않는다).
const MAX_PHOTOS_PER_MEMORY = 3;
const MIN_MEMORIES_FOR_SUMMARY = 3;

export async function POST(request: Request) {
  const { placeId } = (await request.json()) as { placeId?: string };

  if (!placeId) {
    return NextResponse.json(
      { error: "placeId가 필요합니다." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // RLS가 본인 소유 장소만 select되도록 이미 막아준다.
  const { data: place } = await supabase
    .from("places")
    .select("id, name")
    .eq("id", placeId)
    .maybeSingle();

  if (!place) {
    return NextResponse.json(
      { error: "장소를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const { data: memoriesData } = await supabase
    .from("memories")
    .select("photo_urls, comment, memory_date, companion")
    .eq("place_id", placeId)
    .order("memory_date", { ascending: true });

  const memories = memoriesData ?? [];

  if (memories.length < MIN_MEMORIES_FOR_SUMMARY) {
    return NextResponse.json(
      { error: `기록이 ${MIN_MEMORIES_FOR_SUMMARY}개 이상이어야 합니다.` },
      { status: 400 }
    );
  }

  // 서명된 URL을 그대로 넘기면 OpenAI 서버가 그 URL을 직접 다운로드해야 하는데,
  // 가끔 타임아웃이 나서(Unable to download content from the provided URL) 실패한다.
  // 대신 우리 서버에서 직접 다운로드해 base64로 인코딩해서 넘긴다.
  const photoPaths = memories.flatMap((memory) =>
    memory.photo_urls.slice(0, MAX_PHOTOS_PER_MEMORY)
  );
  const dataUrlByPath = new Map<string, string>();
  await Promise.all(
    photoPaths.map(async (path) => {
      const { data } = await supabase.storage
        .from("memory-photos")
        .download(path);
      if (!data) return;
      const buffer = Buffer.from(await data.arrayBuffer());
      const mime = data.type || "image/jpeg";
      dataUrlByPath.set(path, `data:${mime};base64,${buffer.toString("base64")}`);
    })
  );

  // 누구와 자주 갔는지는 AI가 세는 것보다 우리가 직접 집계해서 알려주는 게 정확하다.
  const companionCounts = new Map<string, number>();
  for (const memory of memories) {
    const type = memory.companion?.startsWith("친구")
      ? "친구"
      : (memory.companion ?? "혼자");
    companionCounts.set(type, (companionCounts.get(type) ?? 0) + 1);
  }
  const companionStats = [...companionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${type} ${count}회`)
    .join(", ");

  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "text",
      text:
        `아래는 "${place.name}"이라는 장소에 대해 **단 한 명의 사용자**가 ` +
        "여러 번 방문하면서 남긴 개인 기록들입니다. [기록]으로 구분된 항목들은 " +
        "전부 같은 한 사람의 기록이니, 절대 여러 사람의 각기 다른 이야기처럼 " +
        '쓰지 마세요. "한 사람은 ~했고, 다른 사람은/친구와는 ~했다"처럼 ' +
        "기록을 서로 다른 사람 이야기로 쪼개서 나열하는 건 금지입니다. " +
        "한 사람이 이 장소를 여러 번 다녀간 경험을 스스로 돌아보는 " +
        "하나의 흐름으로 2~3문장으로 정리해주세요.\n\n" +
        `[동행 통계] ${companionStats}\n\n` +
        "작성 규칙:\n" +
        '- 반드시 "이 장소에선"으로 시작하는 문장으로 누구누구와 방문한 적이 ' +
        "있는지(동행 통계 참고) 나열하세요. 이때 혼자 방문한 것과 다른 사람과 " +
        '함께 방문한 것이 헷갈리지 않게, "혼자서도 방문했고, 친구·연인과 함께 ' +
        '방문하기도 했어요"처럼 쉼표로 명확히 구분해서 쓰세요. 그다음 문장은 ' +
        '그중 가장 많이 함께한 상대가 있을 때만 "주로 [상대]와 방문한 적이 ' +
        '많은데," 처럼 시작해서 바로 다음 내용(활동/디테일)으로 자연스럽게 ' +
        '이어지게 쓰세요. "두 번", "한 번"처럼 숫자를 그대로 나열하지 마세요. ' +
        "횟수가 비슷하면 이 문장은 생략해도 됩니다.\n" +
        '- 문체는 모든 문장이 "~해요/~했어요/~있어요/~였어요"로 끝나야 합니다. ' +
        '반말(~해, ~했어, ~있어)은 물론, "~답니다", "~네요", "~거든요" 같은 ' +
        "다른 종결 어미도 쓰지 마세요.\n" +
        '- "~하는 일을 많이 했고", "~하기도 했어요", "그때는", "경험" 같은 ' +
        '장황하거나 어색한 단어/표현 대신, "~한 적이 많았고", "~했어요"처럼 ' +
        "간결하고 자연스럽게 쓰세요.\n" +
        "- 마지막 문장은 지금까지 이야기한 내용을 자연스럽게 갈무리하듯 끝내세요. " +
        "도식적으로 딱 끊어 요약하거나, 아래 예시 문장을 그대로 베끼는 건 금지입니다. " +
        "이 장소만의 구체적인 내용을 담아 스스로 새 문장을 만드세요. " +
        '"다양한 계절의 정취를 느끼며", "이렇게 다양한 경험을 통해 이곳은 소중한 ' +
        '순간들의 공간이 되었어요" 같은 광고 카피 느낌의 상투적인 마무리도 쓰지 마세요.\n' +
        "- 사진을 텍스트만큼 꼼꼼히 살펴보세요. 반려동물, 음식, 특정 사물처럼 " +
        "사진 속에 나온 게 있으면 코멘트에 안 적혀 있어도 반드시 구체적으로 언급하세요. " +
        "예를 들어 사진에 강아지가 있으면 그 기록은 산책이 아니라 " +
        "'강아지와 산책'이라고 구체적으로 써야 합니다.\n" +
        "- 반복되는 활동/소재, 계절 같은 구체적인 디테일을 짚어주세요.\n" +
        "- 반복되는 패턴만 말하지 말고, 특별하거나 인상적인 개별 기록(예: 특정 " +
        "이벤트, 특이한 이유로 방문한 날, 최근에 있었던 일)도 최소 하나는 " +
        "구체적으로 짚어주세요. 매번 비슷한 이야기만 하지 말고, 이 장소만의 " +
        "고유한 순간도 함께 담아야 합니다. 단, 이런 개별 기록을 말할 때 " +
        '"잊을 수 없어요", "인상적이었어요", "소중한 순간이 되었어요" 같은 ' +
        "과장된 감정 표현은 쓰지 말고, \"~한 날도 있어요\"처럼 있었던 일을 " +
        "담담하게 사실 위주로 서술하세요.\n" +
        "- 실제 기록/사진에 없는 내용은 지어내지 마세요.\n" +
        "- 딱딱하고 격식 있는 AI 말투 대신, 사람이 직접 회고하듯 자연스럽게 써주세요.\n\n" +
        "예시 톤(이 문장의 내용이나 마무리 표현을 그대로 베끼지 말고, " +
        "말투와 분위기만 참고하세요):\n" +
        '"이 장소에선 혼자서도 방문했고, 친구나 연인과 함께 방문하기도 했어요. ' +
        "주로 혼자 방문한 적이 많았고, 강아지와 산책하며 커피를 마신 적이 " +
        '많았어요. 가을에 은행잎이 물드는 걸 보러 온 기억도 있어요."',
    },
  ];

  for (const memory of memories) {
    const date = memory.memory_date.slice(0, 10);
    const companionParts = formatCompanionParts(memory.companion);
    const who = companionParts ? companionParts.who : "혼자";
    const comment = memory.comment ? `코멘트: ${memory.comment}` : "코멘트 없음";

    content.push({
      type: "text",
      text: `[기록] 날짜: ${date} / 함께한 사람: ${who} / ${comment}`,
    });

    for (const path of memory.photo_urls.slice(0, MAX_PHOTOS_PER_MEMORY)) {
      const dataUrl = dataUrlByPath.get(path);
      if (dataUrl) {
        content.push({
          type: "image_url",
          image_url: { url: dataUrl, detail: "low" },
        });
      }
    }
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content }],
  });

  const summary = completion.choices[0]?.message?.content?.trim();

  if (!summary) {
    return NextResponse.json(
      { error: "요약 생성에 실패했습니다." },
      { status: 500 }
    );
  }

  await supabase
    .from("places")
    .update({
      ai_summary: summary,
      ai_summary_generated_at: new Date().toISOString(),
      ai_summary_memory_count: memories.length,
    })
    .eq("id", placeId);

  return NextResponse.json({ summary });
}
