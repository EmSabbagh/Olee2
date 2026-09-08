"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BIRD_COLOR = "#3a2a1c";

export default function HeroBird({ radius = 14 }: { radius?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = t * 0.15;

    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(angle) * radius, 6.5 + Math.sin(t * 0.4) * 0.8, Math.sin(angle) * radius);
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }

    const flap = Math.sin(t * 7) * 0.7 + 0.15;
    if (leftWing.current) leftWing.current.rotation.z = flap;
    if (rightWing.current) rightWing.current.rotation.z = -flap;
  });

  return (
    <group ref={groupRef} scale={1.8}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.36, 5]} />
        <meshStandardMaterial color={BIRD_COLOR} flatShading roughness={1} />
      </mesh>
      <mesh ref={leftWing} position={[0.06, 0, 0]}>
        <boxGeometry args={[0.02, 0.42, 0.14]} />
        <meshStandardMaterial color={BIRD_COLOR} flatShading roughness={1} />
      </mesh>
      <mesh ref={rightWing} position={[-0.06, 0, 0]}>
        <boxGeometry args={[0.02, 0.42, 0.14]} />
        <meshStandardMaterial color={BIRD_COLOR} flatShading roughness={1} />
      </mesh>
    </group>
  );
}
