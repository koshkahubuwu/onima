// Pure, client-safe EXP/level helpers. Do NOT import "@/lib/prisma" (or anything
// that pulls in the `pg` driver) from this file — it is imported by client
// components such as level-badge.tsx, and bundling a server-only DB driver
// into the browser bundle breaks Turbopack ("Module not found: Can't resolve 'dns'/'fs'/'net'/'tls'").

export const EXP_REWARDS = {
  POST: 5,
  COMMENT: 2,
  LIKE: 1,
  MESSAGE: 1,
  POLL_VOTE: 1,
  QUIZ_COMPLETE: 10,
  JOIN: 3,
} as const;

export function levelForExp(exp: number) {
  return Math.floor(exp / 100) + 1;
}

export function expProgress(exp: number) {
  const level = levelForExp(exp);
  const levelFloor = (level - 1) * 100;
  const levelCeil = level * 100;
  return { level, current: exp - levelFloor, needed: levelCeil - levelFloor };
}
