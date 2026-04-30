import type { GrowthState } from "../../hooks/useGrowth";
import type { SceneMode } from "../scene/SceneContext";

type WaterFlowProps = {
  stage: GrowthState;
  sceneMode: SceneMode;
};

export function WaterFlow({ stage, sceneMode }: WaterFlowProps) {
  return (
    <div className={`water-flow water-flow-${stage} water-flow-${sceneMode}`} aria-hidden="true">
      <span />
      <span />
    </div>
  );
}
