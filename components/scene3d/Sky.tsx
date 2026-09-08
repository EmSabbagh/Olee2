"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "@/lib/lowpoly-palette";

const skyVertexShader = `
  varying float vHeight;
  void main() {
    vHeight = normalize(position).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  uniform vec3 colorTop;
  uniform vec3 colorBottom;
  varying float vHeight;
  void main() {
    float t = smoothstep(-0.2, 0.55, vHeight);
    gl_FragColor = vec4(mix(colorBottom, colorTop, t), 1.0);
  }
`;

function SkyDome() {
  const uniforms = useMemo(
    () => ({
      colorTop: { value: new THREE.Color(palette.skyZenith) },
      colorBottom: { value: new THREE.Color(palette.cloudLight) },
    }),
    []
  );

  return (
    <mesh renderOrder={-2}>
      <sphereGeometry args={[200, 24, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function CloudBank({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const puffs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 6 * scale,
          (Math.random() - 0.5) * 1.2 * scale,
          (Math.random() - 0.5) * 3 * scale,
        ] as [number, number, number],
        radius: (1.4 + Math.random() * 1.4) * scale,
      })),
    [scale]
  );

  return (
    <group position={position}>
      {puffs.map((puff, i) => (
        <mesh key={i} position={puff.position}>
          <icosahedronGeometry args={[puff.radius, 0]} />
          <meshStandardMaterial
            color={palette.cloudLight}
            flatShading
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Sky() {
  const driftRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (driftRef.current) {
      driftRef.current.rotation.y += delta * 0.006;
    }
  });

  return (
    <>
      <SkyDome />
      <group ref={driftRef}>
        <CloudBank position={[-26, -3, -10]} scale={1.4} />
        <CloudBank position={[22, -4, 14]} scale={1.1} />
        <CloudBank position={[6, -5, -28]} scale={1.6} />
      </group>
    </>
  );
}
