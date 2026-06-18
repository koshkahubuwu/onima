import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isRoomMember, sendMessage } from "@/lib/chat";

const createSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { roomId } = await params;
  if (!(await isRoomMember(roomId, session.user.id))) {
    return NextResponse.json({ error: "No perteneces a esta sala" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { chatRoomId: roomId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
    take: 200,
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { roomId } = await params;
  if (!(await isRoomMember(roomId, session.user.id))) {
    return NextResponse.json({ error: "No perteneces a esta sala" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const message = await sendMessage(roomId, session.user.id, parsed.data.content);
  return NextResponse.json(message);
}
