import { hasFinalConsonant } from "./hangul";

// 마지막 글자의 받침 유무로 "와"/"과"를 자동으로 고른다.
function particle(word: string): "와" | "과" {
  return hasFinalConsonant(word) ? "과" : "와";
}

// "친구 (박지섭)" 같은 저장 형식을, 강조해서 보여줄 "누구와" 부분과
// 나머지 문장으로 나눈다. (예: { who: "친구 박지섭", rest: "과 함께 쌓은 이야기" })
export function formatCompanionParts(
  companion: string | null
): { who: string; rest: string } | null {
  if (!companion) return null;
  if (companion === "혼자") return { who: "혼자", rest: "쌓은 이야기" };

  const friendMatch = companion.match(/^친구(?: \((.+)\))?$/);
  const who = friendMatch
    ? friendMatch[1]
      ? `친구 ${friendMatch[1]}`
      : "친구"
    : companion;

  return { who, rest: `${particle(who)} 함께 쌓은 이야기` };
}
