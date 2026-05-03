import type { CSSProperties } from "react";
import type { SceneMode } from "../../components/scene/SceneContext";
import type { PlantType } from "../../data/plants";
import type { GrowthState } from "../hooks/useGaze";

type PlantProps = {
  type: PlantType;
  state: GrowthState;
  alive: boolean;
  sceneMode: SceneMode;
};

function renderFlower(type: PlantType) {
  const petalCount = type.shape.flowerType === "sunflower" ? 14 : 8;

  if (type.shape.flowerType === "simple") {
    return (
      <>
        <span className="simple-bloom" />
        <span className="extra-petals">
          {Array.from({ length: 8 }, (_, index) => (
            <span
              className="petal extra-petal"
              key={index}
              style={{ "--petal-rotation": `${45 * index + 22.5}deg` } as CSSProperties}
            />
          ))}
        </span>
        <span className="flower-center" />
      </>
    );
  }

  return (
    <>
      {Array.from({ length: petalCount }, (_, index) => (
        <span
          className="petal"
          key={index}
          style={{ "--petal-rotation": `${(360 / petalCount) * index}deg` } as CSSProperties}
        />
      ))}
      <span className="extra-petals">
        {Array.from({ length: petalCount }, (_, index) => (
          <span
            className="petal extra-petal"
            key={index}
            style={
              {
                "--petal-rotation": `${(360 / petalCount) * index + 360 / petalCount / 2}deg`
              } as CSSProperties
            }
          />
        ))}
      </span>
      <span className="flower-center" />
    </>
  );
}

export function Plant({ type, state, alive, sceneMode }: PlantProps) {
  return (
    <div
      className={`plant-root plant-${state} plant-scene-${sceneMode} leaf-${type.shape.leafType} flower-${type.shape.flowerType} ${
        alive ? "plant-alive" : state === "wilt" ? "plant-away" : ""
      }`}
      aria-label={`Plant state: ${state}; plant: ${type.name}`}
      style={
        {
          "--plant-stem": type.colors.stem,
          "--plant-leaf": type.colors.leaf,
          "--plant-flower": type.colors.flower,
          "--plant-flower-deep": type.colors.flowerDeep,
          "--plant-center": type.colors.center
        } as CSSProperties
      }
    >
      <div className="stem" />
      <div className="leaves">
        <span className="leaf leaf-left" />
        <span className="leaf leaf-right" />
      </div>
      <div className="flower">{renderFlower(type)}</div>
      <div className="seed">
        <span className="seed-half seed-left" />
        <span className="seed-half seed-right" />
        <span className="seed-crack" />
      </div>
    </div>
  );
}
