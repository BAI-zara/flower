import type { CSSProperties } from "react";
import type { GrowthState } from "../../hooks/useGrowth";
import type { SceneMode } from "../scene/SceneContext";

type ParticleFieldProps = {
  stage: GrowthState;
  sceneMode: SceneMode;
};

const particleCountByStage: Record<GrowthState, number> = {
  idle: 0,
  watching: 4,
  sprout: 8,
  flower: 16,
  mature: 30,
  giant: 46,
  wilt: 0
};

export function ParticleField({ stage, sceneMode }: ParticleFieldProps) {
  const count = particleCountByStage[stage];

  return (
    <div className={`particle-field particle-field-${stage} particle-field-${sceneMode}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const x = 28 + ((index * 17) % 44);
        const delay = -((index * 0.23) % 4);
        const duration = 3.8 + (index % 9) * 0.22;
        const size = 3 + (index % 5);

        return (
          <span
            key={index}
            style={
              {
                "--particle-x": `${x}%`,
                "--particle-delay": `${delay}s`,
                "--particle-duration": `${duration}s`,
                "--particle-size": `${size}px`
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
