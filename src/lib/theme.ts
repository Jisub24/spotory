// 지도 마커, 커스텀 아이콘처럼 Tailwind 클래스가 아니라 순수 DOM/SVG 코드로
// 색을 지정해야 하는 곳(shadow DOM 안, innerHTML 문자열 등)에서 쓰는 값.
// Tailwind 클래스를 쓸 수 있는 곳은 globals.css의 `--color-primary` 토큰(= `bg-primary` 등)을 쓴다.
export const MARK_COLOR = "#5EEAD4";
