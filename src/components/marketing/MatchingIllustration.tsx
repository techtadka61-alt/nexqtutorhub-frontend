/**
 * Hero graphic for How it works: a stylised map with the student's home at the centre, the 10 km matching
 * radius, verified tutors inside it (one outside, greyed), and floating cards for the three moments of the
 * flow — tutors notified, a tutor applies, the student accepts. Pure SVG/HTML, so it stays crisp at any size.
 */
export function MatchingIllustration() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px]" aria-hidden>
      <div className="absolute inset-[6%] overflow-hidden rounded-[2rem] border border-brand-secondary/20 bg-gradient-to-br from-brand-secondary-light via-surface to-brand-secondary-light shadow-lifted">
        <svg viewBox="0 0 400 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          {/* city blocks + roads */}
          <g fill="var(--color-brand-accent)" opacity="0.18">
            <rect x="18" y="20" width="70" height="46" rx="8" />
            <rect x="108" y="14" width="54" height="60" rx="8" />
            <rect x="300" y="26" width="80" height="50" rx="8" />
            <rect x="20" y="230" width="64" height="70" rx="8" />
            <rect x="300" y="236" width="76" height="56" rx="8" />
            <rect x="236" y="250" width="44" height="50" rx="8" />
          </g>
          <g stroke="var(--color-surface)" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.95">
            <path d="M-10 96 C 90 80, 150 130, 230 110 S 360 70, 420 90" />
            <path d="M-10 210 C 80 220, 170 180, 250 205 S 360 240, 420 220" />
            <path d="M96 -10 C 110 90, 70 180, 110 330" />
            <path d="M286 -10 C 270 100, 320 190, 290 330" />
          </g>
          <g stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="4 6" fill="none">
            <path d="M-10 96 C 90 80, 150 130, 230 110 S 360 70, 420 90" />
            <path d="M-10 210 C 80 220, 170 180, 250 205 S 360 240, 420 220" />
          </g>

          {/* 10 km radius */}
          <circle cx="200" cy="160" r="118" fill="var(--color-brand-secondary)" opacity="0.08" />
          <circle
            cx="200"
            cy="160"
            r="118"
            fill="none"
            stroke="var(--color-brand-secondary)"
            strokeWidth="2"
            strokeDasharray="6 7"
            opacity="0.7"
          />
          <circle cx="200" cy="160" r="118" fill="var(--color-brand-secondary)" className="animate-radar" />
          <circle
            cx="200"
            cy="160"
            r="118"
            fill="var(--color-brand-secondary)"
            className="animate-radar"
            style={{ animationDelay: "1.6s" }}
          />
          <line x1="200" y1="160" x2="318" y2="160" stroke="var(--color-brand-primary)" strokeWidth="1.5" strokeDasharray="3 4" />

          {/* links from home to notified tutors */}
          <g stroke="var(--color-brand-secondary)" strokeWidth="1.5" strokeDasharray="2 5" opacity="0.8">
            <line x1="200" y1="160" x2="138" y2="96" />
            <line x1="200" y1="160" x2="268" y2="112" />
            <line x1="200" y1="160" x2="150" y2="232" />
          </g>

          {/* tutors inside the radius */}
          <TutorPin x={138} y={96} initials="AK" />
          <TutorPin x={268} y={112} initials="RS" />
          <TutorPin x={150} y={232} initials="PV" />
          {/* outside the radius: not notified */}
          <g opacity="0.45">
            <circle cx="360" cy="276" r="13" fill="var(--color-text-secondary)" />
            <text x="360" y="280" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
              MT
            </text>
          </g>

          {/* student's home */}
          <g>
            <circle cx="200" cy="160" r="24" fill="var(--color-brand-primary)" />
            <circle cx="200" cy="160" r="24" fill="none" stroke="white" strokeWidth="4" />
            <path
              d="M189 162 L200 152 L211 162 M192 160 V170 H208 V160"
              fill="none"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>

        {/* radius label */}
        <span className="absolute left-[64%] top-[45%] rounded-full bg-brand-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
          10 km
        </span>
      </div>

      {/* floating moments */}
      <FloatingCard className="left-0 top-[2%] w-[58%]" delay="0s" rotate="-2deg">
        <IconBubble className="bg-brand-secondary-light text-brand-primary">
          <BellIcon />
        </IconBubble>
        <div className="min-w-0">
          <p className="text-xs font-bold text-text-primary sm:text-sm">New tuition request near you</p>
          <p className="truncate text-[11px] text-text-secondary sm:text-xs">Class 10 · Maths, Physics · 2 km away</p>
        </div>
      </FloatingCard>

      <FloatingCard className="right-0 top-[57%] w-[46%]" delay="1.2s" rotate="2deg">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-xs font-bold text-white">
          AK
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-xs font-bold text-text-primary sm:text-sm">
            Anjali applied
            <VerifiedIcon />
          </p>
          <p className="truncate text-[11px] text-text-secondary sm:text-xs">M.Sc · 5 yrs · ₹2,500/mo</p>
        </div>
      </FloatingCard>

      <FloatingCard className="bottom-[1%] left-[8%] w-[56%]" delay="2.4s" rotate="-1deg">
        <IconBubble className="bg-success/10 text-success">
          <CheckIcon />
        </IconBubble>
        <div className="min-w-0">
          <p className="text-xs font-bold text-text-primary sm:text-sm">Tutor accepted</p>
          <p className="truncate text-[11px] text-text-secondary sm:text-xs">Contact details now shared</p>
        </div>
      </FloatingCard>
    </div>
  );
}

function TutorPin({ x, y, initials }: { x: number; y: number; initials: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="17" fill="var(--color-surface)" />
      <circle cx={x} cy={y} r="13" fill="var(--color-brand-secondary)" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
        {initials}
      </text>
      <circle cx={x + 11} cy={y - 11} r="5.5" fill="var(--color-success)" stroke="white" strokeWidth="2" />
    </g>
  );
}

function FloatingCard({
  className,
  delay,
  rotate,
  children,
}: {
  className: string;
  delay: string;
  rotate: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`animate-float absolute flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-2.5 shadow-lifted backdrop-blur sm:p-3 ${className}`}
      style={{ animationDelay: delay, ["--float-rotate" as string]: rotate }}
    >
      {children}
    </div>
  );
}

function IconBubble({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className}`}>{children}</span>;
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9Z" strokeLinejoin="round" />
      <path d="M10.3 21a1.94 1.94 0 003.4 0" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0 text-success">
      <path
        fill="currentColor"
        d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9L3.2 15.8l1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2L12 2Z"
      />
      <path d="M8.5 12.2l2.3 2.3 4.7-4.8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
