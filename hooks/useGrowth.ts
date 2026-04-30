import { useCallback, useRef, useState } from "react";

export type GrowthState = "idle" | "watching" | "sprout" | "flower" | "mature" | "giant" | "wilt";

const LOOK_AWAY_GRACE_MS = 800;

const stageOrder: GrowthState[] = ["idle", "watching", "sprout", "flower", "mature", "giant"];

function targetStageFromTime(focusedMs: number): GrowthState {
  if (focusedMs >= 60000) {
    return "giant";
  }

  if (focusedMs >= 30000) {
    return "mature";
  }

  if (focusedMs >= 10000) {
    return "flower";
  }

  if (focusedMs >= 3000) {
    return "sprout";
  }

  return "watching";
}

function advanceOneStep(current: GrowthState, target: GrowthState) {
  if (current === "wilt" || current === "idle") {
    return target === "idle" ? "idle" : "watching";
  }

  const currentIndex = stageOrder.indexOf(current);
  const targetIndex = stageOrder.indexOf(target);

  if (currentIndex < 0 || targetIndex < 0) {
    return target;
  }

  return stageOrder[Math.min(currentIndex + 1, targetIndex)];
}

export function useGrowth(speedMultiplier = 1) {
  const focusStartRef = useRef<number | null>(null);
  const lastFocusedRef = useRef<number | null>(null);
  const stateRef = useRef<GrowthState>("idle");

  const [growthState, setGrowthState] = useState<GrowthState>("idle");
  const [focusedSeconds, setFocusedSeconds] = useState(0);

  const setStage = useCallback((stage: GrowthState) => {
    stateRef.current = stage;
    setGrowthState(stage);
  }, []);

  const reset = useCallback((stage: GrowthState = "idle") => {
    focusStartRef.current = null;
    lastFocusedRef.current = null;
    setFocusedSeconds(0);
    setStage(stage);
  }, [setStage]);

  const update = useCallback(
    (focused: boolean, now: number, shouldUpdateUi: boolean) => {
      if (focused) {
        if (focusStartRef.current === null) {
          focusStartRef.current = now;
        }

        lastFocusedRef.current = now;
        const elapsed = now - focusStartRef.current;
        const effectiveElapsed = elapsed * speedMultiplier;
        const targetStage = targetStageFromTime(effectiveElapsed);
        const nextStage =
          stateRef.current === targetStage ? targetStage : advanceOneStep(stateRef.current, targetStage);

        if (shouldUpdateUi) {
          setFocusedSeconds(effectiveElapsed / 1000);
          setStage(nextStage);
        }

        return { state: nextStage, seconds: effectiveElapsed / 1000, wilted: false };
      }

      const leftFor =
        lastFocusedRef.current === null ? Number.POSITIVE_INFINITY : now - lastFocusedRef.current;

      if (lastFocusedRef.current !== null && leftFor > LOOK_AWAY_GRACE_MS) {
        focusStartRef.current = null;
        lastFocusedRef.current = null;

        if (stateRef.current !== "wilt") {
          setFocusedSeconds(0);
          setStage("wilt");
        }

        return { state: "wilt" as GrowthState, seconds: 0, wilted: true };
      }

      return { state: stateRef.current, seconds: focusedSeconds, wilted: false };
    },
    [focusedSeconds, setStage, speedMultiplier]
  );

  return {
    growthState,
    focusedSeconds,
    reset,
    update
  };
}
