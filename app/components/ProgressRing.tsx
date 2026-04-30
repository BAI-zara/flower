import type { CSSProperties } from "react";

type ProgressRingProps = {
  seconds: number;
  active: boolean;
  complete: boolean;
};

const RADIUS = 104;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ seconds, active, complete }: ProgressRingProps) {
  const progress = Math.min(Math.max(seconds / 60, 0), 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const marks = [
    { name: "3s", angle: 18 },
    { name: "10s", angle: 60 },
    { name: "30s", angle: 180 },
    { name: "60s", angle: 360 }
  ];

  return (
    <svg
      className={`progress-ring ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
      viewBox="0 0 240 240"
      aria-hidden="true"
    >
      <circle className="ring-track" cx="120" cy="120" r={RADIUS} />
      <circle
        className="ring-fill"
        cx="120"
        cy="120"
        r={RADIUS}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
      />
      {marks.map((mark) => (
        <circle
          className={`ring-mark ring-mark-${mark.name.replace("s", "")}`}
          cx="120"
          cy="16"
          r={mark.name === "60s" ? "5.5" : "3.6"}
          key={mark.name}
          style={{ "--mark-angle": `${mark.angle}deg` } as CSSProperties}
        />
      ))}
    </svg>
  );
}
