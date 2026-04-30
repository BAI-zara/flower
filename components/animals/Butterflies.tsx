"use client";

import { useEffect, useMemo, useRef } from "react";
import type { GrowthState } from "../../hooks/useGrowth";
import type { SceneMode } from "../scene/SceneContext";

type ButterfliesProps = {
  stage: GrowthState;
  sceneMode: SceneMode;
};

function butterflyCount(stage: GrowthState, sceneMode: SceneMode) {
  if (sceneMode === "rain") {
    return 0;
  }

  if (sceneMode === "night") {
    return stage === "flower" || stage === "mature" || stage === "giant" ? 2 : 0;
  }

  if (stage === "giant") {
    return 10;
  }

  if (stage === "mature") {
    return 7;
  }

  if (stage === "flower") {
    return 5;
  }

  return stage === "idle" || stage === "wilt" ? 2 : 3;
}

export function Butterflies({ stage, sceneMode }: ButterfliesProps) {
  const refs = useRef<Array<HTMLSpanElement | null>>([]);
  const butterflies = useMemo(
    () =>
      Array.from({ length: butterflyCount(stage, sceneMode) }, (_, index) => ({
        id: index,
        baseX: 16 + Math.random() * 62,
        baseY: 16 + Math.random() * 34,
        speed: 0.08 + Math.random() * 0.09,
        amplitude: 2.5 + Math.random() * 6,
        drift: 3 + Math.random() * 8,
        phase: Math.random() * Math.PI * 2,
        scale: 0.72 + Math.random() * 0.52,
        direction: Math.random() > 0.5 ? 1 : -1
      })),
    [stage, sceneMode]
  );

  useEffect(() => {
    let frame = 0;

    const animate = (now: number) => {
      const time = now / 1000;

      butterflies.forEach((butterfly, index) => {
        const node = refs.current[index];

        if (!node) {
          return;
        }

        const pause = Math.sin(time * 0.27 + butterfly.phase) > 0.92 ? 0.08 : 1;
        const x =
          butterfly.baseX +
          Math.sin(time * butterfly.speed + butterfly.phase) * butterfly.drift * butterfly.direction * pause;
        const y =
          butterfly.baseY +
          Math.sin(time * butterfly.speed * 2.2 + butterfly.phase) * butterfly.amplitude;
        const rotate = Math.sin(time * butterfly.speed * 2 + butterfly.phase) * 12;

        node.style.transform = `translate3d(${x}vw, ${y}vh, 0) scale(${butterfly.scale}) rotate(${rotate}deg)`;
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [butterflies]);

  return (
    <>
      {butterflies.map((butterfly, index) => (
        <span
          className="butterfly"
          key={butterfly.id}
          ref={(node) => {
            refs.current[index] = node;
          }}
        >
          <span />
          <span />
        </span>
      ))}
    </>
  );
}
