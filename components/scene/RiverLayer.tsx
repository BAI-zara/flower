import type { GrowthState } from "../../hooks/useGrowth";
import { WaterFlow } from "../effects/WaterFlow";
import type { SceneMode } from "./SceneContext";

type RiverLayerProps = {
  stage: GrowthState;
  sceneMode: SceneMode;
};

export function RiverLayer({ stage, sceneMode }: RiverLayerProps) {
  return (
    <div className="scene-layer river-layer" aria-hidden="true">
      <WaterFlow stage={stage} sceneMode={sceneMode} />
      <svg className="river-highlights" viewBox="0 0 1440 420" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waterGlint" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.68" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="water-glint water-glint-1"
          d="M80 218 C240 190 410 235 570 206 C742 176 875 218 1048 188 C1180 166 1288 188 1375 170"
        />
        <path
          className="water-glint water-glint-2"
          d="M168 282 C345 252 500 294 704 262 C905 232 1048 276 1268 238"
        />
      </svg>
    </div>
  );
}
