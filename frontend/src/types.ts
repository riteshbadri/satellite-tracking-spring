export type SatelliteGroup =
  | "latest"
  | "stations"
  | "weather"
  | "starlink"
  | "science"
  | "engineering"
  | "gnss"
  | "galileo"
  | "cubesat"
  | "geo"
  | "resource"
  | "analyst"
  | "sarsat"
  | "dmc"
  | "spire";

export interface Satellite {
  noradAndGroup: string;
  noradId: number;
  name: string;
  groupName: string;
  tleLine1: string;
  tleLine2: string;
}

export interface SatellitePosition {
  noradId: number;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  x: number;
  y: number;
  z: number;
}

export interface OrbitPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
}
