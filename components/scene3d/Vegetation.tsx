"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "@/lib/lowpoly-palette";
import KenneyModel from "./KenneyModel";

const treeModels = ["tree", "tree-crooked", "tree-high", "tree-high-round", "tree-high-crooked"];
const rockModels = ["rock-large", "rock-small", "rock-wide"];

export function GroundShadow({ radius = 0.4 }: { radius?: number }) {
  return (
    <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 10]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.07} />
    </mesh>
  );
}

export function Tree({
  position,
  scale = 1,
  seed = 0,
}: {
  position: [number, number, number];
  scale?: number;
  colorIndex?: number;
  seed?: number;
}) {
  const swayRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => seed * 3.7, [seed]);
  const model = treeModels[Math.floor(Math.abs(seed * 13.7) % treeModels.length)];
  const rotationY = useMemo(() => (Math.abs(seed * 7.13) % 1) * Math.PI * 2, [seed]);

  useFrame(({ clock }) => {
    if (swayRef.current) {
      const t = clock.getElapsedTime();
      swayRef.current.rotation.z = Math.sin(t * 0.8 + phase) * 0.035;
      swayRef.current.rotation.x = Math.cos(t * 0.65 + phase) * 0.025;
    }
  });

  return (
    <group position={position} scale={scale}>
      <GroundShadow radius={0.5} />
      <group ref={swayRef} rotation={[0, rotationY, 0]}>
        <KenneyModel name={model} scale={1.3} />
      </group>
    </group>
  );
}

export function TreeCluster({
  position,
  count = 3,
  seed = 0,
}: {
  position: [number, number, number];
  count?: number;
  seed?: number;
}) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <Tree
          key={i}
          position={[(rand(i * 2) - 0.5) * 1.4, 0, (rand(i * 2 + 1) - 0.5) * 1.4]}
          scale={0.8 + rand(i * 3) * 0.5}
          seed={seed * 10 + i + 1}
        />
      ))}
    </group>
  );
}

export function BoulderCluster({
  position,
  count = 4,
  seed = 0,
}: {
  position: [number, number, number];
  count?: number;
  seed?: number;
}) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 45.164 + n * 12.343) * 12543.112;
    return x - Math.floor(x);
  };

  return (
    <group position={position}>
      <GroundShadow radius={1.1} />
      {Array.from({ length: count }).map((_, i) => {
        const model = rockModels[Math.floor(Math.abs(rand(i * 5)) * rockModels.length) % rockModels.length];
        return (
          <KenneyModel
            key={i}
            name={model}
            position={[(rand(i * 2) - 0.5) * 1.6, 0, (rand(i * 2 + 1) - 0.5) * 1.6]}
            rotation={[0, rand(i) * Math.PI * 2, 0]}
            scale={0.7 + rand(i * 4) * 0.5}
          />
        );
      })}
    </group>
  );
}

export function GrassTuft({ position, scale = 1, seed = 0 }: { position: [number, number, number]; scale?: number; seed?: number }) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 7.13 + n * 3.71) * 9973.13;
    return x - Math.floor(x);
  };

  return (
    <group position={position} scale={scale}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[(rand(i * 2) - 0.5) * 0.2, 0.08, (rand(i * 2 + 1) - 0.5) * 0.2]}
          rotation={[0, rand(i + 5) * Math.PI, (rand(i + 9) - 0.5) * 0.5]}
        >
          <coneGeometry args={[0.03, 0.16, 3]} />
          <meshStandardMaterial color={i % 2 === 0 ? palette.canopyMid : palette.meadowEdge} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

const flowerColors = ["#e8536b", "#f0c84a", "#f2f2f2", "#e0793f"];

export function FlowerPatch({
  position,
  count = 6,
  spread = 1,
  seed = 0,
}: {
  position: [number, number, number];
  count?: number;
  spread?: number;
  seed?: number;
}) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 8.71 + n * 2.63) * 6521.41;
    return x - Math.floor(x);
  };

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <group
          key={i}
          position={[(rand(i * 2) - 0.5) * spread, 0, (rand(i * 2 + 1) - 0.5) * spread]}
          scale={0.6 + rand(i * 3) * 0.5}
        >
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.008, 0.012, 0.18, 4]} />
            <meshStandardMaterial color={palette.canopyDeep} flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.19, 0]}>
            <icosahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial color={flowerColors[i % flowerColors.length]} flatShading roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function GrassPatch({ position, count = 6, spread = 1, seed = 0 }: { position: [number, number, number]; count?: number; spread?: number; seed?: number }) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 5.37 + n * 1.91) * 4321.77;
    return x - Math.floor(x);
  };

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <GrassTuft
          key={i}
          position={[(rand(i * 2) - 0.5) * spread, 0, (rand(i * 2 + 1) - 0.5) * spread]}
          scale={0.7 + rand(i * 3) * 0.6}
          seed={seed * 10 + i}
        />
      ))}
    </group>
  );
}
