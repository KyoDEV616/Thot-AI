interface ThotLogoProps {
  size?: number;
  className?: string;
}

export function ThotLogo({ size = 24, className = "" }: ThotLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Eye of Horus — simplified SVG */}
      <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="1.5" fill="none"
               style={{ color: "var(--color-accent-secondary)" }} />
      <circle cx="12" cy="12" r="2.5" fill="currentColor"
              style={{ color: "var(--color-accent-primary)" }} />
      {/* Pupil */}
      <circle cx="12" cy="12" r="1" fill="currentColor"
              style={{ color: "var(--color-accent-secondary)" }} />
      {/* Lower teardrop line — Horus mark */}
      <path d="M12 18 C10 21, 8 22, 7 21" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" fill="none"
            style={{ color: "var(--color-accent-secondary)" }} />
    </svg>
  );
}
