export function ChevronIcon({
  open,
  width = 7,
  height = 12,
  className = "",
  color = "currentColor",
}: {
  open: boolean;
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox="0 0 7 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${
        open ? "rotate-90" : "rotate-0"
      } ${className}`}
    >
      <path
        d="M1 1L6 6L1 11"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
