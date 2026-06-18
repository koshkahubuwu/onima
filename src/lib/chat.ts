import { prisma } from "@/lib/prisma";
import { awardExp, EXP_REWARDS } from "@/lib/exp";

export async function isRoomMember(roomId: string, userId: string) {
  const membership = await prisma.chatMember.findUnique({
    where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
  });
  return Boolean(membership);
}

export async function sendMessage(roomId: string, senderId: string, content: string) {
  const message = await prisma.message.create({
    data: { chatRoomId: roomId, senderId, content },
    include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
  });

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: { communityId: true },
  });
  if (room) {
    await awardExp(senderId, room.communityId, EXP_REWARDS.MESSAGE);
  }

  return message;
}
