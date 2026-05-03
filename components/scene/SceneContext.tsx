"use client";

import { createContext, useContext, type ReactNode } from "react";

export type SceneMode = "day" | "night" | "rain";

type SceneContextValue = {
  sceneMode: SceneMode;
  setSceneMode: (mode: SceneMode) => void;
};

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({
  sceneMode,
  setSceneMode,
  children
}: SceneContextValue & { children: ReactNode }) {
  return <SceneContext.Provider value={{ sceneMode, setSceneMode }}>{children}</SceneContext.Provider>;
}

export function useSceneMode() {
  const value = useContext(SceneContext);

  if (!value) {
    throw new Error("useSceneMode must be used inside SceneProvider");
  }

  return value;
}

const modes: Array<{ mode: SceneMode; label: string }> = [
  { mode: "day", label: "Day" },
  { mode: "night", label: "Night" },
  { mode: "rain", label: "Rain" }
];

export function SceneModeSwitch() {
  const { sceneMode, setSceneMode } = useSceneMode();

  return (
    <div className="scene-mode-switch" aria-label="Switch scene mode">
      {modes.map((item) => (
        <button
          className={item.mode === sceneMode ? "is-selected" : ""}
          type="button"
          key={item.mode}
          onClick={() => setSceneMode(item.mode)}
          aria-label={`Switch to ${item.mode}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
