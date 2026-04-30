"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import type { GrowthState } from "../../hooks/useGrowth";
import type { SceneMode } from "./SceneContext";

type ParallaxContainerProps = {
  stage: GrowthState;
  sceneMode: SceneMode;
  bloom: boolean;
  looking: boolean;
  children: ReactNode;
};

const depths = {
  sky: 4,
  far: 9,
  river: 15,
  mid: 22,
  animals: 28
};

export function ParallaxContainer({ stage, sceneMode, bloom, looking, children }: ParallaxContainerProps) {
  const frameRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  function updateParallax(clientX: number, clientY: number) {
    if (!rootRef.current) {
      return;
    }

    const rect = rootRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const root = rootRef.current;

      if (!root) {
        return;
      }

      Object.entries(depths).forEach(([name, depth]) => {
        root.style.setProperty(`--${name}-x`, `${x * depth}px`);
        root.style.setProperty(`--${name}-y`, `${y * depth}px`);
      });
    });
  }

  return (
    <main
      ref={rootRef}
      className={`scene page-shell scene-${stage} scene-mode-${sceneMode} ${looking ? "is-looking" : ""} ${
        bloom ? "is-blooming" : ""
      }`}
      onMouseMove={(event) => updateParallax(event.clientX, event.clientY)}
      onPointerLeave={() => updateParallax(window.innerWidth / 2, window.innerHeight / 2)}
      style={
        {
          "--sky-x": "0px",
          "--sky-y": "0px",
          "--far-x": "0px",
          "--far-y": "0px",
          "--river-x": "0px",
          "--river-y": "0px",
          "--mid-x": "0px",
          "--mid-y": "0px",
          "--animals-x": "0px",
          "--animals-y": "0px"
        } as CSSProperties
      }
    >
      {children}
    </main>
  );
}
