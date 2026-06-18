import { prisma } from "@/lib/prisma";

export async function isRoomMember(roomId: string, userId: string) {
  const membership = await prisma.chatMember.findUnique({
    where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
  });
  return Boolean(membership);
}

export async function sendMessage(roomId: string, senderId: string, content: string) {
  return prisma.message.create({
    data: { chatRoomId: roomId, senderId, content },
    include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
  });
}
