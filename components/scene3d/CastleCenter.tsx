"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import type { Group } from "three";
import { GroundShadow, Tree } from "./Vegetation";

function castleUrl(name: string) {
  return `/models/kenney-castle/${name}.glb`;
}

function useCastleModel(name: string) {
  const { scene } = useGLTF(castleUrl(name));
  return useMemo(() => scene.clone(true), [scene]);
}

function CastlePiece({ name, ...props }: { name: string } & ThreeElements["group"]) {
  const object = useCastleModel(name);
  // eslint-disable-next-line react/no-unknown-property
  return <primitive object={object} {...props} />;
}

function CastleFlag({ position, seed }: { position: [number, number, number]; seed: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 2 + seed) * 0.25;
    }
  });
  return (
    <group position={position} ref={ref}>
      <CastlePiece name="flag-banner-long" />
    </group>
  );
}

// Each wall/corner piece has a 1x1 unit footprint (verified from the GLB's
// own bounding box), so a square ring only looks connected if segments are
// spaced exactly 1 unit apart — the earlier version spaced 6 of them
// around a radius-2.6 circle, leaving multi-unit gaps between them.
const WALL_HALF = 2; // 4x4 unit courtyard
const WALL_POSITIONS = [-1.5, -0.5, 0.5, 1.5]; // 4 segments per side, no gaps

/** One straight run of wall segments along an edge of the square. The
 * parent group's own rotation is what reorients each copy of this edge to
 * a different side — these pieces must NOT carry their own rotation too,
 * or the whole edge ends up double-rotated. */
function WallSide() {
  return (
    <>
      {WALL_POSITIONS.map((offset, i) => (
        <CastlePiece key={i} name="wall" position={[offset, 0, -WALL_HALF]} />
      ))}
    </>
  );
}

/** Purely decorative centerpiece island — a small keep, not a service. */
export default function CastleCenter() {
  return (
    <group>
      <GroundShadow radius={3.2} />

      {/* keep */}
      <group position={[0, 0, 0]}>
        <CastlePiece name="tower-square-base" position={[0, 0, 0]} />
        <CastlePiece name="tower-square-mid" position={[0, 1.0, 0]} />
        <CastlePiece name="tower-square-top" position={[0, 2.0, 0]} />
        <CastlePiece name="tower-square-roof" position={[0, 2.3, 0]} />
      </group>

      <CastleFlag position={[0, 4.3, 0]} seed={1} />

      {/* a square curtain wall: one edge, copied and rotated to all 4 sides */}
      <group rotation={[0, 0, 0]}>
        <WallSide />
      </group>
      <group rotation={[0, Math.PI / 2, 0]}>
        <WallSide />
      </group>
      <group rotation={[0, Math.PI, 0]}>
        <WallSide />
      </group>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <WallSide />
      </group>

      {/* corner towers */}
      {[
        [-WALL_HALF, -WALL_HALF],
        [WALL_HALF, -WALL_HALF],
        [WALL_HALF, WALL_HALF],
        [-WALL_HALF, WALL_HALF],
      ].map(([x, z], i) => (
        <CastlePiece key={i} name="wall-corner" position={[x, 0, z]} rotation={[0, (i * Math.PI) / 2, 0]} />
      ))}

      <Tree position={[3.4, 0, 1.6]} scale={1.1} seed={11} />
      <Tree position={[-3.2, 0, -1.4]} scale={1.2} seed={22} />
      <Tree position={[-3.6, 0, 1.8]} scale={0.9} seed={33} />
    </group>
  );
}
