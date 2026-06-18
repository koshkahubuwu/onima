import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string; roomId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { roomId } = await params;
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
  if (!room) {
    return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
  }

  const existing = await prisma.chatMember.findUnique({
    where: { chatRoomId_userId: { chatRoomId: roomId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.chatMember.delete({ where: { id: existing.id } });
    return NextResponse.json({ joined: false });
  }

  await prisma.chatMember.create({ data: { chatRoomId: roomId, userId: session.user.id } });
  return NextResponse.json({ joined: true });
}
