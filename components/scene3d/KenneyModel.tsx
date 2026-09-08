"use client";

import { forwardRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import type { Group } from "three";

const MODEL_BASE = "/models/kenney-fantasy-town";

export function kenneyUrl(name: string) {
  return `${MODEL_BASE}/${name}.glb`;
}

const KenneyModel = forwardRef<
  Group,
  { name: string } & ThreeElements["group"]
>(function KenneyModel({ name, ...props }, ref) {
  const { scene } = useGLTF(kenneyUrl(name));
  // Each instance needs its own clone — the loaded scene is shared/cached.
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return <primitive ref={ref} object={cloned} {...props} />;
});

export default KenneyModel;
