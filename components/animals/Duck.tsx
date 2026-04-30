"use client";

import { useEffect, useRef } from "react";
import type { SceneMode } from "../scene/SceneContext";

export function Duck({ sceneMode }: { sceneMode: SceneMode }) {
  const duckRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const animate = (now: number) => {
      const time = now / 1000;
      const speed = sceneMode === "rain" ? 0.22 : sceneMode === "night" ? 0.08 : 0.14;
      const progress = (Math.sin(time * speed) + 1) / 2;
      const x = -8 + progress * 116;
      const y = 1.5 * Math.sin(time * 2.1);
      const direction = Math.cos(time * speed) >= 0 ? 1 : -1;

      if (duckRef.current) {
        duckRef.current.style.transform = `translate3d(${x}vw, ${y}px, 0) scaleX(${direction})`;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [sceneMode]);

  return (
    <div className="duck" ref={duckRef}>
      <span className="duck-body" />
      <span className="duck-head" />
      <span className="duck-beak" />
      <span className="duck-ripple" />
    </div>
  );
}
