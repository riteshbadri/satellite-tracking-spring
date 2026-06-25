import { useEffect, useRef } from "react";
import {
  CallbackPositionProperty,
  Cartesian3,
  Color,
  ConstantProperty,
  Entity,
  Ion,
  JulianDate,
  Math as CesiumMath,
  PolylineGlowMaterialProperty,
  Viewer
} from "cesium";
import { groupColor } from "../constants";
import type { OrbitPoint, Satellite, SatellitePosition } from "../types";

Ion.defaultAccessToken = "";

interface GlobeViewProps {
  satellites: Satellite[];
  positions: Map<number, SatellitePosition>;
  selected: Satellite | null;
  orbitPath: OrbitPoint[];
  onSelect: (satellite: Satellite) => void;
}

interface MotionState {
  from: Cartesian3;
  to: Cartesian3;
  startMs: number;
  durationMs: number;
}

function interpolateMotion(motion: MotionState, result?: Cartesian3) {
  const elapsed = performance.now() - motion.startMs;
  const amount = Math.min(Math.max(elapsed / motion.durationMs, 0), 1);
  return Cartesian3.lerp(motion.from, motion.to, amount, result ?? new Cartesian3());
}

const OVERVIEW_DESTINATION = Cartesian3.fromDegrees(78.9629, 20.5937, 33000000);
const OVERVIEW_ORIENTATION = {
  heading: CesiumMath.toRadians(0),
  pitch: CesiumMath.toRadians(-90),
  roll: 0
};

function flyToOverview(viewer: Viewer, duration = 0.9) {
  viewer.trackedEntity = undefined;
  viewer.camera.flyTo({
    destination: OVERVIEW_DESTINATION,
    orientation: OVERVIEW_ORIENTATION,
    duration
  });
}

export function GlobeView({ satellites, positions, selected, orbitPath, onSelect }: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const entityMapRef = useRef<Map<number, Entity>>(new Map());
  const satelliteMapRef = useRef<Map<number, Satellite>>(new Map());
  const motionMapRef = useRef<Map<number, MotionState>>(new Map());
  const selectedPathRef = useRef<Entity | null>(null);
  const lastSelectionRef = useRef<number | null>(null);
  const pendingFrameRef = useRef(true);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false
    });

    viewer.scene.globe.enableLighting = true;
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true;
    }
    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 160000;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 52000000;
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0.85;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.75;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.7;
    viewer.camera.setView({
      destination: OVERVIEW_DESTINATION,
      orientation: OVERVIEW_ORIENTATION
    });

    viewer.selectedEntityChanged.addEventListener((entity) => {
      if (!entity?.id) return;
      const satellite = satelliteMapRef.current.get(Number(entity.id));
      if (satellite) onSelect(satellite);
    });

    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [onSelect]);

  useEffect(() => {
    const visibleSatellites = new Map(satellites.slice(0, 700).map((satellite) => [satellite.noradId, satellite]));
    if (selected) visibleSatellites.set(selected.noradId, selected);
    satelliteMapRef.current = visibleSatellites;
    pendingFrameRef.current = true;
  }, [satellites, selected]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const activeIds = new Set<number>();
    const renderedSatellites = Array.from(satelliteMapRef.current.values());
    renderedSatellites.forEach((satellite) => {
      const position = positions.get(satellite.noradId);
      if (!position) return;
      activeIds.add(satellite.noradId);

      const selectedObject = selected?.noradId === satellite.noradId;
      const cartesian = Cartesian3.fromDegrees(position.longitude, position.latitude, position.altitude * 1000);
      const color = Color.fromCssColorString(groupColor(satellite.groupName));
      const entityMap = entityMapRef.current;
      const existing = entityMap.get(satellite.noradId);
      const currentMotion = motionMapRef.current.get(satellite.noradId);
      const currentPosition = currentMotion ? interpolateMotion(currentMotion) : cartesian;

      motionMapRef.current.set(satellite.noradId, {
        from: currentPosition,
        to: cartesian,
        startMs: performance.now(),
        durationMs: selectedObject ? 2800 : 5600
      });

      if (existing) {
        if (existing.point) {
          existing.point.pixelSize = new ConstantProperty(selectedObject ? 11 : 6);
          existing.point.color = new ConstantProperty(selectedObject ? Color.WHITE : color);
          existing.point.outlineColor = new ConstantProperty(color);
        }
      } else {
        const entity = viewer.entities.add({
          id: String(satellite.noradId),
          name: satellite.name,
          position: new CallbackPositionProperty((_, result) => {
            const motion = motionMapRef.current.get(satellite.noradId);
            return motion ? interpolateMotion(motion, result as Cartesian3 | undefined) : cartesian;
          }, false),
          point: {
            color,
            outlineColor: Color.BLACK,
            outlineWidth: 1,
            pixelSize: 6
          }
        });
        entityMap.set(satellite.noradId, entity);
      }
    });

    entityMapRef.current.forEach((entity, noradId) => {
      if (!activeIds.has(noradId)) {
        viewer.entities.remove(entity);
        entityMapRef.current.delete(noradId);
        motionMapRef.current.delete(noradId);
      }
    });

    if (!selected && pendingFrameRef.current) {
      pendingFrameRef.current = false;
      lastSelectionRef.current = null;
      flyToOverview(viewer, 0.9);
    }
  }, [positions, satellites, selected, orbitPath]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (selectedPathRef.current) {
      viewer.entities.remove(selectedPathRef.current);
      selectedPathRef.current = null;
    }

    if (!orbitPath.length) return;

    selectedPathRef.current = viewer.entities.add({
      name: "Selected orbit path",
      polyline: {
        positions: orbitPath.map((point) => Cartesian3.fromDegrees(point.longitude, point.latitude, point.altitude * 1000)),
        width: 2,
        material: new PolylineGlowMaterialProperty({
          color: Color.CYAN,
          glowPower: 0.12
        })
      }
    });
  }, [orbitPath]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !selected) return;

    const entity = entityMapRef.current.get(selected.noradId);
    if (!entity) return;

    if (lastSelectionRef.current !== selected.noradId) {
      lastSelectionRef.current = selected.noradId;
      viewer.trackedEntity = undefined;
      viewer.flyTo(entity, {
        duration: 0.8,
        offset: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-35),
          range: 6400000
        }
      });
    }
  }, [selected, positions]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const clock = viewer.clock;
    const tick = window.setInterval(() => {
      clock.currentTime = JulianDate.now();
    }, 1000);
    return () => window.clearInterval(tick);
  }, []);

  return <div className="cesium-host" ref={containerRef} />;
}
