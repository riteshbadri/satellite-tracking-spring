import type { SatelliteGroup } from "./types";

export const GROUPS: Array<{ id: SatelliteGroup; label: string; color: string }> = [
  { id: "latest", label: "Latest", color: "#21d4f3" },
  { id: "stations", label: "Stations", color: "#f6b13d" },
  { id: "weather", label: "Weather", color: "#61d394" },
  { id: "starlink", label: "Starlink", color: "#2e83ff" },
  { id: "science", label: "Science", color: "#d2a8ff" },
  { id: "engineering", label: "Engineering", color: "#ff8f6b" },
  { id: "gnss", label: "GNSS", color: "#8bd3ff" },
  { id: "galileo", label: "Galileo", color: "#93f0b7" },
  { id: "cubesat", label: "CubeSat", color: "#f9d66d" },
  { id: "geo", label: "GEO", color: "#ff5a67" },
  { id: "resource", label: "Resource", color: "#a0aec0" },
  { id: "analyst", label: "Analyst", color: "#6ee7f9" },
  { id: "sarsat", label: "SARSAT", color: "#f472b6" },
  { id: "dmc", label: "DMC", color: "#c7d2fe" },
  { id: "spire", label: "Spire", color: "#7dd3fc" }
];

export const groupColor = (groupName?: string) => {
  const group = GROUPS.find((item) => item.id === groupName?.toLowerCase());
  return group?.color ?? "#21d4f3";
};
