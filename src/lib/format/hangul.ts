// 마지막 글자에 받침이 있는지 확인한다. 한글이 아니면 받침 없음으로 취급한다.
export function hasFinalConsonant(word: string): boolean {
  const last = word.at(-1) ?? "";
  return /[가-힣]/.test(last) && (last.charCodeAt(0) - 0xac00) % 28 !== 0;
}
