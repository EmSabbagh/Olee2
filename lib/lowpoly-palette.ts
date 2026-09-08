// Shared low-poly world palette. Every island uses these same values —
// only a small per-service accent color (see lib/services.ts) varies.
export const palette = {
  roofTerracotta: "#D9704F",
  roofShadow: "#B2543A",
  wallCream: "#EFE6D8",
  timber: "#9C6B4A",
  rockUnderside: "#6E3B36",

  meadowTop: "#CFD69B",
  meadowEdge: "#A8B478",
  canopyMid: "#6F9A57",
  canopyDeep: "#3E6E4B",
  stone: "#C9CBBE",

  skyZenith: "#1B6FB8",
  skyMid: "#2C8FE0",
  horizonHaze: "#8FCBEE",
  cloudLight: "#E8F3FA",
  shallowWater: "#35B9CE",
} as const;

// Flat, modern UI colors — deliberately not fantasy-themed.
export const ui = {
  brandBlue: "#1B6FB8",
  pageBackground: "#F2F4F6",
  ink: "#1C2430",
  inkMuted: "#5B6572",
  cardWhite: "#FFFFFF",
} as const;
