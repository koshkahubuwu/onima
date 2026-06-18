import { prisma } from "@/lib/prisma";

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

export async function awardExp(userId: string, communityId: string, amount: number) {
  const before = await prisma.membership.findUnique({
    where: { userId_communityId: { userId, communityId } },
    select: { exp: true },
  });
  if (!before) return;

  const after = await prisma.membership.update({
    where: { userId_communityId: { userId, communityId } },
    data: { exp: { increment: amount } },
    select: { exp: true },
  });

  if (levelForExp(after.exp) > levelForExp(before.exp)) {
    await prisma.notification.create({
      data: {
        userId,
        type: "LEVEL_UP",
        communityId,
      },
    });
  }
}
