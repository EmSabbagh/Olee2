"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { palette } from "@/lib/lowpoly-palette";
import { getDetailTexture, roughenGeometry } from "@/lib/proceduralTexture";

function makeUndulatingTopGeometry(radius: number, height: number, segments: number, seed: number) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments, 1);
  const position = geometry.attributes.position;
  const halfHeight = height / 2;

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    if (y > halfHeight - 0.001) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const swell =
        Math.sin(x * 0.5 + seed) * Math.cos(z * 0.5 + seed * 1.7) * 0.12 +
        Math.sin((x + z) * 0.35 + seed * 2.3) * 0.06;
      position.setY(i, y + swell);
    }
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export default function IslandTerrain({
  radius = 5,
  slabHeight = 0.7,
  rockHeight = 3.4,
  segments = 12,
  seed = 0,
}: {
  radius?: number;
  slabHeight?: number;
  rockHeight?: number;
  segments?: number;
  seed?: number;
}) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Cheap irregularity: a slight elliptical squish and per-island rotation,
  // rather than a perfectly circular disc, so no two islands read the same.
  const { squishX, squishZ, rotation } = useMemo(
    () => ({
      squishX: 0.92 + rand(1) * 0.16,
      squishZ: 0.92 + rand(2) * 0.16,
      rotation: rand(3) * Math.PI * 2,
    }),
    [seed]
  );

  const capHeight = slabHeight * 0.45;
  const wallHeight = slabHeight - capHeight;

  const topGeometry = useMemo(
    () => makeUndulatingTopGeometry(radius, capHeight, segments, seed * 3.1),
    [radius, capHeight, segments, seed]
  );

  const rockGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(radius * 0.97, rockHeight, segments, 4);
    return roughenGeometry(geometry, radius * 0.045, seed * 5.7 + 9);
  }, [radius, rockHeight, segments, seed]);

  const coarseTex = getDetailTexture("coarse");
  const fineTex = getDetailTexture("fine");

  return (
    <group rotation={[0, rotation, 0]} scale={[squishX, 1, squishZ]}>
      {/* meadow cap, gently undulating */}
      <mesh position={[0, wallHeight + capHeight / 2, 0]} geometry={topGeometry} castShadow receiveShadow>
        <meshStandardMaterial color={palette.meadowTop} map={coarseTex} flatShading roughness={1} metalness={0} />
      </mesh>

      {/* meadow-edge collar, the hard color break before the rock */}
      <mesh position={[0, wallHeight / 2, 0]} receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.97, wallHeight, segments, 1]} />
        <meshStandardMaterial color={palette.meadowEdge} map={fineTex} flatShading roughness={1} metalness={0} />
      </mesh>

      <mesh
        position={[0, -rockHeight / 2 + 0.02, 0]}
        rotation={[Math.PI, 0, 0]}
        geometry={rockGeometry}
        receiveShadow
      >
        <meshStandardMaterial color={palette.rockUnderside} map={coarseTex} flatShading roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
