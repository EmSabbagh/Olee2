"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Sky from "./Sky";
import World, { type DragState, nearestStopIndex, stopCount, stopRotation } from "./World";

const DRAG_SENSITIVITY = 0.0012;
const MAX_VELOCITY = 0.006;
const KEY_STEP_COOLDOWN_MS = 500;

const BASE_CAMERA = new THREE.Vector3(0, 15, 32);
const ZOOMED_CAMERA = new THREE.Vector3(0, 11, 23);

/** Dollies the camera in as `zoom` (1 to ~1.2) increases, matching what the
 * old flat-map's CSS zoom buttons used to do. */
function CameraRig({ zoom }: { zoom: number }) {
  useFrame(({ camera }) => {
    const t = Math.min(1, Math.max(0, (zoom - 1) / 0.2));
    camera.position.lerpVectors(BASE_CAMERA, ZOOMED_CAMERA, t);
    camera.lookAt(0, 0.5, 0);
  });
  return null;
}

export default function WorldMapScene({
  onStopChange,
  focusIndex,
  zoom = 1,
}: {
  onStopChange: (index: number) => void;
  /** When this changes to a new value, the scene snaps to face that stop —
   * used to keep the scene in sync with navigation triggered outside it
   * (footer nav, the work index sheet, etc). */
  focusIndex?: number | null;
  zoom?: number;
}) {
  const dragState = useRef<DragState>({
    rotationY: 0,
    velocity: 0,
    mode: "idle",
    snapTarget: 0,
    targetIndex: 0,
  });
  const pointer = useRef({ dragging: false, lastX: 0, lastT: 0 });
  const lastKeyStepAt = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(e: React.PointerEvent) {
    pointer.current.dragging = true;
    pointer.current.lastX = e.clientX;
    pointer.current.lastT = performance.now();
    dragState.current.mode = "dragging";
    dragState.current.velocity = 0;
    setIsDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointer.current.dragging) return;
    const now = performance.now();
    // Clamp dt so a stalled/coalesced pointer event can't produce a huge
    // instantaneous velocity spike when it resumes.
    const dt = Math.max(8, now - pointer.current.lastT) / 1000;
    const deltaX = e.clientX - pointer.current.lastX;
    const angularDelta = deltaX * DRAG_SENSITIVITY;

    dragState.current.rotationY += angularDelta;
    const instVelocity = angularDelta / dt / 60;
    dragState.current.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, instVelocity));

    pointer.current.lastX = e.clientX;
    pointer.current.lastT = now;
  }

  function endDrag() {
    if (!pointer.current.dragging) return;
    pointer.current.dragging = false;
    setIsDragging(false);
    if (Math.abs(dragState.current.velocity) < 0.0015) {
      const target = nearestStopIndex(dragState.current.rotationY);
      dragState.current.mode = "snapping";
      dragState.current.targetIndex = target;
      dragState.current.snapTarget = stopRotation(target);
    } else {
      dragState.current.mode = "coasting";
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.repeat) return; // ignore the browser's auto-repeat while a key is held
      const now = performance.now();
      if (now - lastKeyStepAt.current < KEY_STEP_COOLDOWN_MS) return;
      lastKeyStepAt.current = now;

      // Step from the last committed target, never from the current
      // (possibly still-animating) rotation — that's what let rapid
      // presses occasionally read the wrong "current" stop and appear to
      // reverse direction.
      const current = dragState.current.targetIndex;
      const next = e.key === "ArrowRight" ? (current + 1) % stopCount : (current - 1 + stopCount) % stopCount;
      dragState.current.velocity = 0;
      dragState.current.mode = "snapping";
      dragState.current.targetIndex = next;
      dragState.current.snapTarget = stopRotation(next);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (focusIndex == null) return;
    if (dragState.current.targetIndex === focusIndex) return;
    dragState.current.velocity = 0;
    dragState.current.mode = "snapping";
    dragState.current.targetIndex = focusIndex;
    dragState.current.snapTarget = stopRotation(focusIndex);
  }, [focusIndex]);

  return (
    <div
      className="world-scene-3d touch-none"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      <Canvas
        shadows
        camera={{ position: BASE_CAMERA.toArray(), fov: 40 }}
        dpr={[1, 1.6]}
      >
        <ambientLight intensity={0.65} color="#bcd9f2" />
        <hemisphereLight color="#bfe3ff" groundColor="#c98a5a" intensity={0.5} />
        <directionalLight position={[8, 14, 6]} intensity={1.1} color="#fff3d6" castShadow />
        <Sky />
        <World dragState={dragState} onStopChange={onStopChange} />
        <CameraRig zoom={zoom} />
      </Canvas>
    </div>
  );
}
