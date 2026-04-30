"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlantSelector } from "../components/PlantSelector";
import { Scene } from "../components/scene/Scene";
import type { SceneMode } from "../components/scene/SceneContext";
import { defaultPlant, getPlantById, plants } from "../data/plants";
import { Plant } from "./components/Plant";
import { ProgressRing } from "./components/ProgressRing";
import { useGaze } from "./hooks/useGaze";

const STORAGE_KEY = "flowe-selected-plant";
const SCENE_STORAGE_KEY = "flowe-scene-mode";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState(defaultPlant.id);
  const [sceneMode, setSceneMode] = useState<SceneMode>("day");
  const { appState, growthState, focusedSeconds, isLooking, message, start } = useGaze(
    videoRef,
    sceneMode
  );

  useEffect(() => {
    const savedPlantId = window.localStorage.getItem(STORAGE_KEY);

    if (savedPlantId) {
      setSelectedPlantId(getPlantById(savedPlantId).id);
    }

    const savedSceneMode = window.localStorage.getItem(SCENE_STORAGE_KEY);

    if (savedSceneMode === "day" || savedSceneMode === "night" || savedSceneMode === "rain") {
      setSceneMode(savedSceneMode);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, selectedPlantId);
  }, [selectedPlantId]);

  useEffect(() => {
    window.localStorage.setItem(SCENE_STORAGE_KEY, sceneMode);
  }, [sceneMode]);

  const selectedPlant = useMemo(() => getPlantById(selectedPlantId), [selectedPlantId]);
  const displayMessage =
    appState === "ready" && growthState === "flower" ? selectedPlant.bloomText : message;
  const sparkleCount =
    growthState === "giant" ? 22 : growthState === "mature" ? 16 : growthState === "flower" ? 10 : 6;

  return (
    <Scene stage={growthState} looking={isLooking} sceneMode={sceneMode} setSceneMode={setSceneMode}>
      <section className="scene-layer plant-core garden" aria-live="polite">
        <div className="focus-stage">
          <ProgressRing seconds={focusedSeconds} active={isLooking} complete={growthState === "giant"} />
          <Plant type={selectedPlant} state={growthState} alive={isLooking} sceneMode={sceneMode} />
          <div className="soil-disc" aria-hidden="true" />
          <div className="sparkles" aria-hidden="true">
            {Array.from({ length: sparkleCount }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="scene-layer ui-overlay">
        <div className="status">
          <p>{displayMessage}</p>
          {appState === "ready" ? <span>{focusedSeconds.toFixed(1)}s / 60.0s</span> : null}
        </div>

        {appState === "idle" || appState === "error" ? (
          <button className="start-button" type="button" onClick={start}>
            {appState === "idle" ? "点击开始" : "再试一次"}
          </button>
        ) : null}

        {appState === "loading" ? <div className="loading-dot" aria-hidden="true" /> : null}
      </section>

      <PlantSelector plants={plants} selectedId={selectedPlant.id} onSelect={setSelectedPlantId} />

      <button
        className="debug-toggle"
        type="button"
        onClick={() => setDebugOpen((open) => !open)}
        aria-expanded={debugOpen}
        aria-controls="camera-preview"
      >
        调试
      </button>
      <video
        ref={videoRef}
        id="camera-preview"
        className={`camera-preview ${debugOpen ? "is-open" : ""}`}
        muted
        playsInline
        aria-hidden={!debugOpen}
      />
    </Scene>
  );
}
