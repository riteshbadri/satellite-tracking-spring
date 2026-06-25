import type { OrbitPoint, Satellite, SatelliteGroup, SatellitePosition } from "./types";

const headers = { Accept: "application/json" };

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function fetchSatellites(group: SatelliteGroup): Promise<Satellite[]> {
  return readJson<Satellite[]>(`/satellites/fetch/${group}`);
}

export function fetchPosition(noradId: number): Promise<SatellitePosition> {
  return readJson<SatellitePosition>(`/satellites/${noradId}/position`);
}

export function fetchOrbitPath(noradId: number): Promise<OrbitPoint[]> {
  return readJson<OrbitPoint[]>(`/satellites/${noradId}/path`);
}
