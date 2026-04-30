import { CloudLayer } from "./CloudLayer";

export function SkyLayer() {
  return (
    <div className="scene-layer sky-layer" aria-hidden="true">
      <div className="nature-backdrop" />
      <div className="scene-vignette" />
      <div className="center-glow" />
      <CloudLayer />
    </div>
  );
}
