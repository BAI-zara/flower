export type PlantType = {
  id: string;
  name: string;
  icon: string;
  bloomText: string;
  colors: {
    stem: string;
    leaf: string;
    flower: string;
    flowerDeep: string;
    center: string;
  };
  shape: {
    leafType: "round" | "long" | "heart";
    flowerType: "simple" | "multi" | "sunflower";
  };
};

export const plants: PlantType[] = [
  {
    id: "sprout",
    name: "小绿芽",
    icon: "🌱",
    bloomText: "它为你开了 🌱",
    colors: {
      stem: "#5faa65",
      leaf: "#70b878",
      flower: "#8fd98f",
      flowerDeep: "#4fba66",
      center: "#f4c766"
    },
    shape: {
      leafType: "round",
      flowerType: "simple"
    }
  },
  {
    id: "sakura",
    name: "樱花",
    icon: "🌸",
    bloomText: "它为你开了一树樱花 🌸",
    colors: {
      stem: "#6fac72",
      leaf: "#75bd82",
      flower: "#f7a6bf",
      flowerDeep: "#e67499",
      center: "#ffd36d"
    },
    shape: {
      leafType: "heart",
      flowerType: "multi"
    }
  },
  {
    id: "sunflower",
    name: "向日葵",
    icon: "🌻",
    bloomText: "它朝着你盛开 🌻",
    colors: {
      stem: "#5f9f56",
      leaf: "#6fb56f",
      flower: "#f6c744",
      flowerDeep: "#e59a28",
      center: "#7b5130"
    },
    shape: {
      leafType: "long",
      flowerType: "sunflower"
    }
  },
  {
    id: "bluebell",
    name: "小蓝花",
    icon: "💙",
    bloomText: "它把一点蓝色送给你 💙",
    colors: {
      stem: "#5aa37d",
      leaf: "#69b58e",
      flower: "#82b7ff",
      flowerDeep: "#4e82d9",
      center: "#f7dc86"
    },
    shape: {
      leafType: "round",
      flowerType: "multi"
    }
  }
];

export const defaultPlant = plants[0];

export function getPlantById(id: string) {
  return plants.find((plant) => plant.id === id) ?? defaultPlant;
}
