"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { islands } from "@/lib/world";
import { palette } from "@/lib/lowpoly-palette";
import IslandTerrain from "./IslandTerrain";
import { TreeCluster, BoulderCluster, GrassPatch } from "./Vegetation";
import { SignalTower, Pavilion, CottageCluster } from "./Landmarks";
import CastleCenter from "./CastleCenter";
import HeroBird from "./HeroBird";

export interface DragState {
  rotationY: number;
  velocity: number;
  mode: "idle" | "dragging" | "coasting" | "snapping";
  snapTarget: number;
  /** The stop we're resting at or snapping toward — the single source of
   * truth for "which island is active," updated only when a drag/coast
   * naturally settles or an arrow-key/external focus request steps it.
   * Never recomputed from the current (possibly mid-animation) rotation. */
  targetIndex: number;
}

export const RING_RADIUS = 7.5;
// All three islands sit as equally-spaced satellites on the ring — the
// centerpiece at the axis is decoration only, never a stop.
const SATELLITE_COUNT = islands.length;
const FRONT_ANGLE = Math.PI / 2;
export const stopCount = islands.length;

function satelliteAngle(k: number) {
  return (k / SATELLITE_COUNT) * Math.PI * 2;
}

export function stopRotation(index: number) {
  return satelliteAngle(index) - FRONT_ANGLE;
}

function normalizeAngle(a: number) {
  const twoPi = Math.PI * 2;
  let x = a % twoPi;
  if (x < 0) x += twoPi;
  return x;
}

function angleDiff(a: number, b: number) {
  let d = normalizeAngle(a - b);
  if (d > Math.PI) d -= Math.PI * 2;
  return d;
}

export function nearestStopIndex(rotation: number) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < stopCount; i++) {
    const dist = Math.abs(angleDiff(rotation, stopRotation(i)));
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

// campaigns -> a plaza/banner landmark, reels -> a motion-rig pavilion,
// social -> a cottage cluster — order matches lib/world.ts's islands array.
const landmarks = [SignalTower, Pavilion, CottageCluster];

const CENTER_RADIUS = 3.6;
const SAT_RADIUS = 3.1;
const CENTER_TOP_Y = 0.55;

function Bridge({ angle }: { angle: number }) {
  const nearEdge = CENTER_RADIUS - 0.3;
  const farEdge = RING_RADIUS - SAT_RADIUS + 0.3;
  const length = farEdge - nearEdge;
  const mid = (nearEdge + farEdge) / 2;

  return (
    <group position={[Math.cos(angle) * mid, CENTER_TOP_Y, Math.sin(angle) * mid]} rotation={[0, -angle, 0]}>
      <mesh>
        <boxGeometry args={[length, 0.08, 0.55]} />
        <meshStandardMaterial color={palette.timber} flatShading roughness={1} />
      </mesh>
    </group>
  );
}

export default function World({
  dragState,
  onStopChange,
}: {
  dragState: React.MutableRefObject<DragState>;
  onStopChange: (index: number) => void;
}) {
  const worldRef = useRef<THREE.Group>(null);
  const lastReportedIndex = useRef(-1);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const state = dragState.current;

    if (state.mode === "coasting") {
      state.rotationY += state.velocity * delta * 60;
      state.velocity *= Math.pow(0.9, delta * 60);
      if (Math.abs(state.velocity) < 0.0015) {
        state.velocity = 0;
        state.mode = "snapping";
        state.targetIndex = nearestStopIndex(state.rotationY);
        state.snapTarget = stopRotation(state.targetIndex);
      }
    } else if (state.mode === "snapping") {
      const diff = angleDiff(state.snapTarget, state.rotationY);
      state.rotationY += diff * Math.min(1, delta * 3.2);
      if (Math.abs(diff) < 0.002) {
        state.rotationY = state.snapTarget;
        state.mode = "idle";
      }
    }

    if (worldRef.current) {
      worldRef.current.rotation.y = state.rotationY;
    }

    // Report the authoritative target the moment we commit to it, rather
    // than re-deriving "nearest stop" from a rotation that's still
    // mid-animation (which is what let rapid input read the wrong stop).
    if (state.mode === "snapping" || state.mode === "idle") {
      if (state.targetIndex !== lastReportedIndex.current) {
        lastReportedIndex.current = state.targetIndex;
        onStopChange(state.targetIndex);
      }
    }
  });

  return (
    <group ref={worldRef}>
      {/* decorative centerpiece — not an island, never a stop */}
      <group>
        <IslandTerrain radius={CENTER_RADIUS} slabHeight={0.55} rockHeight={2.4} seed={0} />
        <group position={[0, 0.55, 0]}>
          <CastleCenter />
        </group>
        <GrassPatch position={[0.5, 0.65, -0.7]} count={6} spread={1.3} seed={4} />
        <GrassPatch position={[-1.7, 0.65, 1.3]} count={4} spread={1} seed={5} />
      </group>

      {Array.from({ length: SATELLITE_COUNT }).map((_, k) => (
        <Bridge key={`bridge-${k}`} angle={satelliteAngle(k)} />
      ))}

      {islands.map((island, k) => {
        const angle = satelliteAngle(k);
        const x = Math.cos(angle) * RING_RADIUS;
        const z = Math.sin(angle) * RING_RADIUS;
        const Landmark = landmarks[k];

        return (
          <group key={island.id} position={[x, 0, z]}>
            <IslandTerrain radius={SAT_RADIUS} slabHeight={0.5} rockHeight={1.8} seed={k + 10} />
            <Landmark accent={island.accent} />
            <TreeCluster position={[1.7, 0.7, 0.9]} seed={k + 20} count={2} />
            <BoulderCluster position={[-1.5, 0.7, -0.9]} seed={k + 30} count={3} />
            <GrassPatch position={[0.4, 0.62, -1.4]} count={5} spread={1.1} seed={k + 40} />
          </group>
        );
      })}

      <HeroBird radius={RING_RADIUS + 2.5} />
    </group>
  );
}
