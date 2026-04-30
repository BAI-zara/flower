import type { ReactNode } from "react";
import type { GrowthState } from "../../hooks/useGrowth";
import { ParticleField } from "../effects/ParticleField";
import { AnimalLayer } from "./AnimalLayer";
import { FarLayer } from "./FarLayer";
import { MidLayer } from "./MidLayer";
import { NightLayer } from "./NightLayer";
import { ParallaxContainer } from "./ParallaxContainer";
import { RainLayer } from "./RainLayer";
import { RiverLayer } from "./RiverLayer";
import { SceneModeSwitch, SceneProvider, type SceneMode } from "./SceneContext";
import { SkyLayer } from "./SkyLayer";

type SceneProps = {
  stage: GrowthState;
  looking: boolean;
  sceneMode: SceneMode;
  setSceneMode: (mode: SceneMode) => void;
  children: ReactNode;
};

function isBloomingStage(stage: GrowthState) {
  return stage === "flower" || stage === "mature" || stage === "giant";
}

export function Scene({ stage, looking, sceneMode, setSceneMode, children }: SceneProps) {
  return (
    <SceneProvider sceneMode={sceneMode} setSceneMode={setSceneMode}>
      <ParallaxContainer
        stage={stage}
        sceneMode={sceneMode}
        bloom={isBloomingStage(stage)}
        looking={looking}
      >
        <SkyLayer />
        <FarLayer />
        <RiverLayer stage={stage} sceneMode={sceneMode} />
        <MidLayer />
        <AnimalLayer stage={stage} sceneMode={sceneMode} />
        <ParticleField stage={stage} sceneMode={sceneMode} />
        <NightLayer />
        <RainLayer />
        <SceneModeSwitch />
        {children}
      </ParallaxContainer>
    </SceneProvider>
  );
}
