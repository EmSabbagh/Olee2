import * as THREE from "three";

const cache = new Map<string, THREE.CanvasTexture>();

/**
 * A shared, generated-at-runtime "detail" texture: a near-white canvas with
 * soft mottled blotches. Multiplied onto a material's flat base color via
 * `map`, it breaks up the perfectly-uniform "clay" look of a flat-shaded
 * material without needing any external image asset.
 */
export function getDetailTexture(variant: "fine" | "coarse" = "fine"): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const cached = cache.get(variant);
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // fine grain speckle
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  const grain = variant === "fine" ? 22 : 14;
  for (let i = 0; i < data.length; i += 4) {
    const n = 235 - Math.random() * grain;
    data[i] = n;
    data[i + 1] = n;
    data[i + 2] = n;
  }
  ctx.putImageData(image, 0, 0);

  // soft blotches for organic mottling
  const blotchCount = variant === "fine" ? 26 : 16;
  for (let i = 0; i < blotchCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = (variant === "fine" ? 5 : 14) + Math.random() * (variant === "fine" ? 10 : 22);
    const dark = Math.random() > 0.5;
    const shade = dark ? 0 : 255;
    const alpha = 0.12 + Math.random() * 0.15;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${shade},${shade},${shade},${alpha})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // A single repeat: most meshes here map their whole surface to one 0-1 UV
  // square (a cylinder cap, a box face, an icosahedron face), so tiling the
  // small canvas across it just produces a visible artificial grid instead
  // of organic mottling.
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;

  cache.set(variant, texture);
  return texture;
}

/** Perturb a geometry's vertices outward/inward along their normal by a
 * small seeded amount, so perfectly-regular shapes (icosahedra, cylinders)
 * read as rougher, more natural forms instead of polished/gem-like solids. */
export function roughenGeometry(geometry: THREE.BufferGeometry, amount: number, seed: number) {
  geometry.computeVertexNormals();
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;

  for (let i = 0; i < position.count; i++) {
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);
    const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const rand = n - Math.floor(n);
    const offset = (rand - 0.5) * 2 * amount;

    position.setXYZ(i, position.getX(i) + nx * offset, position.getY(i) + ny * offset, position.getZ(i) + nz * offset);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}
