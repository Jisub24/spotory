import { MARK_COLOR } from "@/lib/theme";

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round((num >> 16) * amount));
  const g = Math.max(
    0,
    ((num >> 8) & 0xff) - Math.round(((num >> 8) & 0xff) * amount)
  );
  const b = Math.max(0, (num & 0xff) - Math.round((num & 0xff) * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

// 책 한 권을 3면으로 그린다: 윗면(표지, 기울어진 평행사변형) + 앞면(책장, 흰색, 두껍고
// 아래쪽 가장자리가 살짝 볼록한 곡선) + 옆면(표지보다 어두운 색, 오른쪽 끝).
function Book({
  x,
  y,
  length,
  skewX,
  skewY,
  pagesHeight,
  bulge,
  rotate,
  color,
}: {
  x: number;
  y: number;
  length: number;
  skewX: number;
  skewY: number;
  pagesHeight: number;
  bulge: number;
  rotate: number;
  color: string;
}) {
  const top = `${x},${y} ${x + length},${y} ${x + length + skewX},${y - skewY} ${x + skewX},${y - skewY}`;
  const side = `${x + length},${y} ${x + length + skewX},${y - skewY} ${x + length + skewX},${y - skewY + pagesHeight} ${x + length},${y + pagesHeight}`;

  const bottomY = y + pagesHeight;
  const front = `M ${x},${y} L ${x + length},${y} L ${x + length},${bottomY} Q ${x + length / 2},${bottomY + bulge} ${x},${bottomY} Z`;

  const centerX = x + length / 2 + skewX / 2;
  const centerY = y - skewY / 2 + pagesHeight / 2;

  return (
    <g transform={`rotate(${rotate} ${centerX} ${centerY})`}>
      <polygon
        points={side}
        fill={darken(color, 0.25)}
        stroke="#000"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <polygon
        points={top}
        fill={color}
        stroke="#000"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d={front}
        fill="#fff"
        stroke="#000"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function BooksIcon({
  size = 20,
  color = MARK_COLOR,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Book
        x={2}
        y={15.5}
        length={13}
        skewX={4}
        skewY={3.5}
        pagesHeight={4.5}
        bulge={1.3}
        rotate={-13}
        color={color}
      />
      <Book
        x={4}
        y={10}
        length={12.5}
        skewX={4}
        skewY={3.5}
        pagesHeight={4.5}
        bulge={1.3}
        rotate={10}
        color={color}
      />
      <Book
        x={5}
        y={4.5}
        length={12.5}
        skewX={4}
        skewY={3.5}
        pagesHeight={4.5}
        bulge={1.3}
        rotate={-5}
        color={color}
      />
    </svg>
  );
}
