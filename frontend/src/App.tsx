import { useEffect, useMemo, useState } from "react";
import { Activity, Crosshair, Eye, Menu, Radar, Search, SquareStack, X } from "lucide-react";
import { fetchOrbitPath, fetchPosition, fetchSatellites } from "./api";
import { GROUPS } from "./constants";
import { GlobeView } from "./components/GlobeView";
import type { OrbitPoint, Satellite, SatelliteGroup, SatellitePosition } from "./types";

export function App() {
  const [activeGroup, setActiveGroup] = useState<SatelliteGroup>("latest");
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [positions, setPositions] = useState<Map<number, SatellitePosition>>(new Map());
  const [selected, setSelected] = useState<Satellite | null>(null);
  const [orbitPath, setOrbitPath] = useState<OrbitPoint[]>([]);
  const [groupCounts, setGroupCounts] = useState<Partial<Record<SatelliteGroup, number>>>({});
  const [catalogCache, setCatalogCache] = useState<Partial<Record<SatelliteGroup, Satellite[]>>>({});
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showOrbit, setShowOrbit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [utcNow, setUtcNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setUtcNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled(
      GROUPS.map(async (group) => ({
        group: group.id,
        items: await fetchSatellites(group.id)
      }))
    ).then((results) => {
      if (cancelled) return;

      const nextCounts: Partial<Record<SatelliteGroup, number>> = {};
      const nextCache: Partial<Record<SatelliteGroup, Satellite[]>> = {};
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          nextCounts[result.value.group] = result.value.items.length;
          nextCache[result.value.group] = result.value.items;
        }
      });

      setGroupCounts(nextCounts);
      setCatalogCache(nextCache);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelected(null);
    setOrbitPath([]);
    setPositions(new Map());

    const cached = catalogCache[activeGroup];
    const catalogRequest = cached ? Promise.resolve(cached) : fetchSatellites(activeGroup);

    catalogRequest
      .then((items) => {
        if (cancelled) return;
        setSatellites(items);
        setGroupCounts((current) => ({ ...current, [activeGroup]: items.length }));
        setCatalogCache((current) => ({ ...current, [activeGroup]: items }));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load satellites");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeGroup]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setShowOrbit(true);

    fetchPosition(selected.noradId).then((position) => {
      if (cancelled) return;
      setPositions((current) => new Map(current).set(position.noradId, position));
    });

    fetchOrbitPath(selected.noradId)
      .then((path) => {
        if (!cancelled) setOrbitPath(path);
      })
      .catch(() => {
        if (!cancelled) setOrbitPath([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const filteredSatellites = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return satellites;
    return satellites.filter((satellite) => {
      return satellite.name.toLowerCase().includes(normalized) || String(satellite.noradId).includes(normalized);
    });
  }, [query, satellites]);

  const positionTargets = useMemo(() => {
    const targetMap = new Map<number, Satellite>();
    filteredSatellites.slice(0, 700).forEach((satellite) => targetMap.set(satellite.noradId, satellite));
    if (selected) targetMap.set(selected.noradId, selected);
    return Array.from(targetMap.values());
  }, [filteredSatellites, selected]);

  useEffect(() => {
    if (!positionTargets.length) return;
    let cancelled = false;

    const refreshPositions = () => {
      Promise.allSettled(positionTargets.map((satellite) => fetchPosition(satellite.noradId))).then((results) => {
        if (cancelled) return;
        setPositions((current) => {
          const next = new Map(current);
          results.forEach((result) => {
            if (result.status === "fulfilled") {
              next.set(result.value.noradId, result.value);
            }
          });
          return next;
        });
      });
    };

    refreshPositions();
    const timer = window.setInterval(refreshPositions, selected ? 3000 : 6000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [positionTargets, selected]);

  const selectedPosition = selected ? positions.get(selected.noradId) ?? null : null;
  const activeGroupLabel = GROUPS.find((group) => group.id === activeGroup)?.label ?? activeGroup;
  const clearSelection = () => {
    setSelected(null);
    setOrbitPath([]);
    setShowOrbit(true);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Radar size={24} />
          <div>
            <p>Spaceshii SSA</p>
            <span>Real-time satellite operations</span>
          </div>
        </div>

        <label className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by satellite or NORAD ID"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={16} />
            </button>
          ) : null}
        </label>

        <button className="icon-button" type="button" onClick={() => setSidebarOpen((value) => !value)}>
          <Menu size={18} />
          Groups
        </button>
      </header>

      <section className="dashboard">
        <aside className={isSidebarOpen ? "sidebar" : "sidebar collapsed"}>
          <div className="panel-heading">
            <SquareStack size={18} />
            <span>Satellite Groups</span>
          </div>

          <div className="group-list">
            {GROUPS.map((group) => (
              <button
                className={group.id === activeGroup ? "group-row active" : "group-row"}
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
              >
                <span className="color-key" style={{ backgroundColor: group.color }} />
                <span>{group.label}</span>
                <strong>{groupCounts[group.id] ?? "--"}</strong>
              </button>
            ))}
          </div>

          <div className="results-list">
            <p>{filteredSatellites.length} visible objects</p>
            {filteredSatellites.slice(0, 80).map((satellite) => (
              <button
                className={selected?.noradId === satellite.noradId ? "result-row active" : "result-row"}
                key={satellite.noradAndGroup}
                type="button"
                onClick={() => setSelected(satellite)}
              >
                <span>{satellite.name}</span>
                <small>NORAD {satellite.noradId}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="globe-stage">
          <GlobeView
            satellites={filteredSatellites}
            positions={positions}
            selected={selected}
            orbitPath={showOrbit ? orbitPath : []}
            onSelect={setSelected}
          />
          {loading ? <div className="status-banner">Loading orbital catalog...</div> : null}
          {error ? <div className="status-banner error">{error}</div> : null}
        </section>

        <aside className="details-panel">
          <div className="panel-heading">
            <Activity size={18} />
            <span>Object Details</span>
          </div>

          {selected ? (
            <>
              <div className="identity-block">
                <span>{selected.groupName}</span>
                <h1>{selected.name}</h1>
                <p>NORAD {selected.noradId}</p>
              </div>

              <div className="metric-grid">
                <Metric label="Latitude" value={selectedPosition ? selectedPosition.latitude.toFixed(4) : "--"} />
                <Metric label="Longitude" value={selectedPosition ? selectedPosition.longitude.toFixed(4) : "--"} />
                <Metric label="Altitude" value={selectedPosition ? `${selectedPosition.altitude.toFixed(1)} km` : "--"} />
                <Metric label="Path points" value={String(orbitPath.length)} />
              </div>

              <div className="action-stack">
                <button className="secondary-button" type="button" onClick={() => setShowOrbit((value) => !value)}>
                  <Eye size={17} />
                  {showOrbit ? "Hide Orbit Path" : "Show Orbit Path"}
                </button>
                <button className="secondary-button" type="button" onClick={clearSelection}>
                  <X size={17} />
                  Back to Overview
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Crosshair size={28} />
              <h2>No satellite selected</h2>
              <p>Select an object from the globe or search results to inspect its position and orbit path.</p>
            </div>
          )}
        </aside>
      </section>

      <footer className="stats-bar">
        <span>Total loaded: {satellites.length}</span>
        <span>Active group: {activeGroupLabel}</span>
        <span>Selected: {selected?.name ?? "None"}</span>
        <span>UTC: {utcNow.toISOString().replace("T", " ").slice(0, 19)}</span>
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
