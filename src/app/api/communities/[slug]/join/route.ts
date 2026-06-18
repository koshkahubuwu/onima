import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { slug } = await params;
  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) {
    return NextResponse.json({ error: "Comunidad no encontrada" }, { status: 404 });
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId: community.id } },
  });
  if (existing) {
    await prisma.membership.delete({ where: { id: existing.id } });
    return NextResponse.json({ joined: false });
  }

  await prisma.membership.create({
    data: { userId: session.user.id, communityId: community.id },
  });

  const generalRoom = await prisma.chatRoom.findFirst({
    where: { communityId: community.id, name: "General" },
  });
  if (generalRoom) {
    await prisma.chatMember.upsert({
      where: { chatRoomId_userId: { chatRoomId: generalRoom.id, userId: session.user.id } },
      create: { chatRoomId: generalRoom.id, userId: session.user.id },
      update: {},
    });
  }

  return NextResponse.json({ joined: true });
}
