"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "@/lib/lowpoly-palette";
import { getDetailTexture, roughenGeometry } from "@/lib/proceduralTexture";
import { GroundShadow, Tree, FlowerPatch } from "./Vegetation";
import KenneyModel from "./KenneyModel";

function Flag({
  position,
  variant,
  seed,
}: {
  position: [number, number, number];
  variant: "banner-green" | "banner-red";
  seed: number;
}) {
  const poleRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (poleRef.current) {
      const t = clock.getElapsedTime();
      poleRef.current.rotation.y = Math.sin(t * 2.4 + seed) * 0.3;
    }
  });

  return (
    <group position={position} ref={poleRef}>
      <KenneyModel name={variant} scale={1.1} />
    </group>
  );
}

function Weathervane({ position = [0, 0, 0] as [number, number, number] }) {
  const vaneRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (vaneRef.current) vaneRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.24, 5]} />
        <meshStandardMaterial color="#3a2a1c" flatShading roughness={1} />
      </mesh>
      <group ref={vaneRef} position={[0, 0.25, 0]}>
        <mesh position={[0.13, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.26, 3]} />
          <meshStandardMaterial color="#3a2a1c" flatShading roughness={1} />
        </mesh>
        <mesh position={[-0.1, 0, 0]}>
          <boxGeometry args={[0.2, 0.02, 0.02]} />
          <meshStandardMaterial color="#3a2a1c" flatShading roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

function useRoughIcosahedron(radius: number, detail: number, amount: number, seed: number) {
  return useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    return roughenGeometry(geometry, amount, seed);
  }, [radius, detail, amount, seed]);
}

function Cottage({
  position = [0, 0, 0] as [number, number, number],
  wallRadius = 0.7,
  wallHeight = 1,
  roofRadius = 1.1,
  roofHeight = 0.9,
}) {
  const fineTex = getDetailTexture("fine");

  return (
    <group position={position}>
      <GroundShadow radius={roofRadius * 0.9} />
      <mesh position={[0, wallHeight / 2, 0]}>
        <cylinderGeometry args={[wallRadius, wallRadius, wallHeight, 8]} />
        <meshStandardMaterial color={palette.wallCream} map={fineTex} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, wallHeight + roofHeight / 2 - 0.1, 0]}>
        <coneGeometry args={[roofRadius, roofHeight, 8]} />
        <meshStandardMaterial color={palette.roofTerracotta} map={fineTex} flatShading roughness={1} />
      </mesh>
    </group>
  );
}

/** Purely decorative centerpiece island — not a service, never a stop. */
export function CenterMonument() {
  const fineTex = getDetailTexture("fine");
  const trunkGeometry = useRoughIcosahedron(0.14, 0, 0.02, 3);
  const canopyGeometry = useRoughIcosahedron(1.1, 1, 0.09, 8);

  return (
    <group>
      <GroundShadow radius={1.5} />
      <mesh position={[0, 1.1, 0]} geometry={trunkGeometry} scale={[1, 6, 1]}>
        <meshStandardMaterial color="#2b2320" map={fineTex} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 2.7, 0]} geometry={canopyGeometry}>
        <meshStandardMaterial color={palette.canopyDeep} map={fineTex} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 3.1, 0]} geometry={canopyGeometry} scale={0.7} rotation={[0.4, 0.8, 0]}>
        <meshStandardMaterial color={palette.canopyMid} map={fineTex} flatShading roughness={1} />
      </mesh>
      <TreeRing radius={2.6} count={4} />
    </group>
  );
}

/** Campaigns — a signal tower on a plaza, flags, a well. */
export function SignalTower({ accent }: { accent: string }) {
  const flagVariants: ("banner-green" | "banner-red")[] = ["banner-green", "banner-red", "banner-green"];
  const fineTex = getDetailTexture("fine");
  const coarseTex = getDetailTexture("coarse");
  // Matches the satellite IslandTerrain slabHeight in World.tsx — the
  // meadow surface sits here, not at the tower's own y=0 (rock level).
  const groundY = 0.5;

  return (
    <group>
      {/* plaza */}
      <mesh position={[0, groundY + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.9, 14]} />
        <meshStandardMaterial color={palette.stone} map={coarseTex} flatShading roughness={1} />
      </mesh>

      <GroundShadow radius={0.7} />
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 2.8, 8]} />
        <meshStandardMaterial color={palette.wallCream} map={fineTex} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <coneGeometry args={[0.55, 0.9, 8]} />
        <meshStandardMaterial color={palette.roofTerracotta} map={fineTex} flatShading roughness={1} />
      </mesh>
      <Weathervane position={[0, 3.42, 0]} />

      {flagVariants.map((variant, i) => {
        const angle = (i / flagVariants.length) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 0.45, 2.55 - i * 0.15, Math.sin(angle) * 0.45]} rotation={[0, -angle, 0]}>
            <Flag position={[0, 0, 0]} variant={variant} seed={i * 2.1} />
          </group>
        );
      })}

      <KenneyModel name="fountain-round" position={[1.3, groundY, -1.2]} scale={1.2} />
      <FlowerPatch position={[-1.3, groundY + 0.02, 1.1]} count={6} spread={0.9} seed={7} />
      <TreeRing radius={2.6} count={4} />
    </group>
  );
}

/** Branding — a workshop with a kiln, crates, and a carved signpost. */
export function Workshop({ accent }: { accent: string }) {
  const fineTex = getDetailTexture("fine");
  const kilnGeometry = useRoughIcosahedron(0.5, 1, 0.05, 12);

  return (
    <group>
      <Cottage position={[0, 0, 0]} />
      <mesh position={[1.4, 0.4, 0.6]} geometry={kilnGeometry} scale={[1, 0.75, 1]}>
        <meshStandardMaterial color={palette.roofShadow} map={fineTex} flatShading roughness={1} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-1.2 + i * 0.35, 0.2, 1.1]}>
          <boxGeometry args={[0.3, 0.4, 0.3]} />
          <meshStandardMaterial color={palette.timber} map={fineTex} flatShading roughness={1} />
        </mesh>
      ))}
      <mesh position={[-1.8, 0.6, -0.6]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 5]} />
        <meshStandardMaterial color={palette.timber} map={fineTex} flatShading roughness={1} />
      </mesh>
      <mesh position={[-1.8, 1.05, -0.6]}>
        <boxGeometry args={[0.6, 0.35, 0.06]} />
        <meshStandardMaterial color={accent} map={fineTex} flatShading roughness={1} />
      </mesh>
    </group>
  );
}

/** Photography — a lighthouse with a lantern room and a small pier. */
export function Lighthouse({ accent }: { accent: string }) {
  const fineTex = getDetailTexture("fine");
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const map = (waterRef.current?.material as THREE.MeshStandardMaterial)?.map;
    if (map) {
      map.offset.x += delta * 0.03;
      map.offset.y += delta * 0.018;
    }
  });

  return (
    <group>
      <GroundShadow radius={0.65} />
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 2.6, 8]} />
        <meshStandardMaterial color={palette.wallCream} map={fineTex} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 2.75, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.5, 8]} />
        <meshStandardMaterial color={accent} map={fineTex} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 3.15, 0]}>
        <coneGeometry args={[0.45, 0.5, 8]} />
        <meshStandardMaterial color={palette.roofTerracotta} map={fineTex} flatShading roughness={1} />
      </mesh>
      {/* pier */}
      <mesh position={[1.8, 0.08, 0]}>
        <boxGeometry args={[2.6, 0.16, 0.7]} />
        <meshStandardMaterial color={palette.timber} map={fineTex} flatShading roughness={1} />
      </mesh>
      {/* small water pool, gently shimmering */}
      <mesh ref={waterRef} position={[3.4, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.3, 10]} />
        <meshStandardMaterial color={palette.shallowWater} map={fineTex} flatShading roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Videography — an open pavilion with a slowly rotating rig on the roof. */
export function Pavilion({ accent }: { accent: string }) {
  const rigRef = useRef<THREE.Group>(null);
  const fineTex = getDetailTexture("fine");

  useFrame((_, delta) => {
    if (rigRef.current) rigRef.current.rotation.y += delta * 0.6;
  });

  const postPositions: [number, number, number][] = [
    [0.8, 0.6, 0.8],
    [-0.8, 0.6, 0.8],
    [0.8, 0.6, -0.8],
    [-0.8, 0.6, -0.8],
  ];

  return (
    <group>
      <GroundShadow radius={1.1} />
      {postPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.07, 0.07, 1.2, 6]} />
          <meshStandardMaterial color={palette.timber} map={fineTex} flatShading roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 1.4, 0]}>
        <coneGeometry args={[1.3, 0.6, 4]} />
        <meshStandardMaterial color={palette.roofTerracotta} map={fineTex} flatShading roughness={1} />
      </mesh>
      <group ref={rigRef} position={[0, 1.85, 0]}>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}>
              <boxGeometry args={[0.5, 0.06, 0.12]} />
              <meshStandardMaterial color={accent} map={fineTex} flatShading roughness={1} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Social Media — the densest cluster of small cottages linked by footbridges. */
export function CottageCluster({ accent }: { accent: string }) {
  const fineTex = getDetailTexture("fine");
  const spots: [number, number, number][] = [
    [0, 0, 0],
    [1.6, 0, 0.6],
    [-1.4, 0, 0.8],
    [0.3, 0, -1.6],
  ];

  return (
    <group>
      {spots.map((pos, i) => (
        <Cottage key={i} position={pos} wallRadius={0.5 + (i % 2) * 0.1} wallHeight={0.8} roofRadius={0.85} roofHeight={0.7} />
      ))}
      <mesh position={[0, 2.4, 0]}>
        <icosahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color={accent} map={fineTex} flatShading roughness={1} />
      </mesh>
    </group>
  );
}

/** 3D Modeling — a quarry terrace of stacked geometric blocks. */
export function QuarryTerrace({ accent }: { accent: string }) {
  const fineTex = getDetailTexture("fine");
  const blocks: { position: [number, number, number]; size: number; color: string; seed: number }[] = [
    { position: [0, 0.4, 0], size: 0.9, color: palette.stone, seed: 1 },
    { position: [0.9, 0.7, 0.4], size: 0.6, color: accent, seed: 2 },
    { position: [-0.8, 0.55, -0.5], size: 0.7, color: palette.wallCream, seed: 3 },
    { position: [0.2, 1.2, -0.2], size: 0.5, color: palette.stone, seed: 4 },
    { position: [-0.4, 1.0, 0.7], size: 0.45, color: accent, seed: 5 },
  ];

  const geometries = useMemo(
    () => blocks.map((block) => roughenGeometry(new THREE.IcosahedronGeometry(block.size, 0), block.size * 0.06, block.seed)),
    []
  );

  return (
    <group>
      <GroundShadow radius={1.3} />
      {blocks.map((block, i) => (
        <mesh key={i} position={block.position} rotation={[0.3 * i, 0.6 * i, 0]} geometry={geometries[i]}>
          <meshStandardMaterial color={block.color} map={fineTex} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** Presentations — tiered seating facing a raised stage. */
export function Amphitheatre({ accent }: { accent: string }) {
  const fineTex = getDetailTexture("fine");
  const tiers = [2.2, 1.7, 1.2];

  return (
    <group>
      <GroundShadow radius={2.4} />
      {tiers.map((radius, i) => (
        <mesh key={i} position={[0, i * 0.22, 0.4]}>
          <cylinderGeometry args={[radius, radius, 0.2, 16, 1, false, Math.PI * 0.15, Math.PI * 0.7]} />
          <meshStandardMaterial color={palette.stone} map={fineTex} flatShading roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 0.15, -1]}>
        <boxGeometry args={[1.6, 0.3, 0.9]} />
        <meshStandardMaterial color={accent} map={fineTex} flatShading roughness={1} />
      </mesh>
    </group>
  );
}

function TreeRing({ radius, count }: { radius: number; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <Tree
            key={i}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            colorIndex={i}
            seed={i + 40}
          />
        );
      })}
    </>
  );
}
