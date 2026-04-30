import type { CSSProperties } from "react";

export function NightLayer() {
  return (
    <div className="scene-layer night-layer" aria-hidden="true">
      <div className="moon" />
      <div className="stars">
        {Array.from({ length: 42 }, (_, index) => {
          const left = 6 + ((index * 19) % 88);
          const top = 5 + ((index * 13) % 48);
          const delay = -((index * 0.37) % 4);
          const size = 1.5 + (index % 3);

          return (
            <span
              key={index}
              style={
                {
                  "--star-left": `${left}%`,
                  "--star-top": `${top}%`,
                  "--star-delay": `${delay}s`,
                  "--star-size": `${size}px`
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
