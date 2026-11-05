export const spring = {
  enter: { type: "spring", stiffness: 260, damping: 26, mass: 1 },
  soft: { type: "spring", stiffness: 180, damping: 22, mass: 1 },
  exit: { type: "spring", stiffness: 300, damping: 34, mass: 1 },
} as const;

export type SpringPresetKey = keyof typeof spring;

export function resolveTransition(
  preset: SpringPresetKey,
  prefersReducedMotion: boolean
) {
  if (prefersReducedMotion) {
    return { duration: 0.15 };
  }
  return spring[preset];
}
