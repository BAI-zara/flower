"use client";

import type { CSSProperties } from "react";
import type { PlantType } from "../data/plants";

type PlantSelectorProps = {
  plants: PlantType[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function PlantSelector({ plants, selectedId, onSelect }: PlantSelectorProps) {
  return (
    <nav className="plant-selector" aria-label="Choose a plant">
      {plants.map((plant) => (
        <button
          className={`plant-card ${plant.id === selectedId ? "is-selected" : ""}`}
          type="button"
          key={plant.id}
          onClick={() => onSelect(plant.id)}
          style={
            {
              "--selector-flower": plant.colors.flower,
              "--selector-leaf": plant.colors.leaf,
              "--selector-center": plant.colors.center
            } as CSSProperties
          }
        >
          <span className={`mini-plant mini-${plant.shape.flowerType}`} aria-hidden="true">
            <span className="mini-stem" />
            <span className="mini-leaf" />
            <span className="mini-bloom">{plant.icon}</span>
          </span>
          <span>{plant.name}</span>
        </button>
      ))}
    </nav>
  );
}
