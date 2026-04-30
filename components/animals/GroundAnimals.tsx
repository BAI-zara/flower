"use client";

import { useEffect, useRef } from "react";
import type { SceneMode } from "../scene/SceneContext";

export function GroundAnimals({ sceneMode }: { sceneMode: SceneMode }) {
  const rabbitRef = useRef<HTMLDivElement | null>(null);
  const deerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const animate = (now: number) => {
      const time = now / 1000;
      const calm = sceneMode === "night" ? 0.45 : sceneMode === "rain" ? 0.68 : 1;
      const rabbitPulse = Math.max(0, Math.sin(time * 0.78 * calm - 1.2));
      const rabbitHop = rabbitPulse > 0.82 ? (rabbitPulse - 0.82) * 120 : 0;
      const deerLift = Math.max(0, Math.sin(time * 0.52 * calm + 1.4));

      if (rabbitRef.current) {
        rabbitRef.current.style.transform = `translate3d(${rabbitHop * 0.35}px, ${-rabbitHop}px, 0) rotate(${-rabbitHop * 0.12}deg)`;
      }

      if (deerRef.current) {
        deerRef.current.style.transform = `translate3d(0, ${deerLift > 0.92 ? -4 : 0}px, 0) rotate(${deerLift > 0.92 ? -2 : 0}deg)`;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [sceneMode]);

  return (
    <>
      <div className="rabbit-motion" ref={rabbitRef} />
      <div className="deer-motion" ref={deerRef} />
    </>
  );
}
