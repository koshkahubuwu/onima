import { prisma } from "@/lib/prisma";
import { levelForExp } from "@/lib/exp-level";

export { EXP_REWARDS, levelForExp, expProgress } from "@/lib/exp-level";

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
