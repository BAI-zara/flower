import { Butterflies } from "../animals/Butterflies";
import { Duck } from "../animals/Duck";
import { GroundAnimals } from "../animals/GroundAnimals";
import type { GrowthState } from "../../hooks/useGrowth";
import type { SceneMode } from "./SceneContext";

type AnimalLayerProps = {
  stage: GrowthState;
  sceneMode: SceneMode;
};

export function AnimalLayer({ stage, sceneMode }: AnimalLayerProps) {
  return (
    <div className="scene-layer animal-layer" aria-hidden="true">
      <Duck sceneMode={sceneMode} />
      <GroundAnimals sceneMode={sceneMode} />
      <Butterflies stage={stage} sceneMode={sceneMode} />
    </div>
  );
}
