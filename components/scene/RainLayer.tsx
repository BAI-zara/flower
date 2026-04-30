import type { CSSProperties } from "react";

export function RainLayer() {
  return (
    <div className="scene-layer rain-layer" aria-hidden="true">
      <div className="rain-drops">
        {Array.from({ length: 72 }, (_, index) => {
          const left = (index * 37) % 100;
          const delay = -((index * 0.11) % 2.8);
          const duration = 0.58 + (index % 8) * 0.045;
          const length = 24 + (index % 5) * 8;

          return (
            <span
              key={index}
              style={
                {
                  "--rain-left": `${left}%`,
                  "--rain-delay": `${delay}s`,
                  "--rain-duration": `${duration}s`,
                  "--rain-length": `${length}px`
                } as CSSProperties
              }
            />
          );
        })}
      </div>
      <div className="rain-ripples">
        {Array.from({ length: 18 }, (_, index) => {
          const left = 8 + ((index * 23) % 84);
          const top = 34 + ((index * 11) % 42);
          const delay = -((index * 0.29) % 3.6);

          return (
            <span
              key={index}
              style={
                {
                  "--ripple-left": `${left}%`,
                  "--ripple-top": `${top}%`,
                  "--ripple-delay": `${delay}s`
                } as CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
