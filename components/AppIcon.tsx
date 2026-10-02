export function AppIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <path
        d="M100,27 L147,41 L147,99 Q147,134 100,156 Q53,134 53,99 L53,41 Z"
        fill="var(--color-brand)"
      />
      <path d="M100,9 Q110,23 104,36 Q100,43 96,36 Q90,23 100,9 Z" fill="var(--color-streak)" />
      <text x="100" y="94" textAnchor="middle" fontSize="40" fontWeight="600" fill="#f6efe4">
        C1
      </text>
    </svg>
  );
}
