import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const createSchema = z.object({
  name: z.string().min(1).max(40),
  description: z.string().max(200).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const { slug } = await params;
  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) {
    return NextResponse.json({ error: "Comunidad no encontrada" }, { status: 404 });
  }

  const rooms = await prisma.chatRoom.findMany({
    where: { communityId: community.id },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { members: true } },
      members: session?.user?.id ? { where: { userId: session.user.id } } : false,
    },
  });

  return NextResponse.json(
    rooms.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: r.createdAt,
      memberCount: r._count.members,
      isMember: Boolean(r.members?.length),
    }))
  );
}

export async function POST(
  req: Request,
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

  const membership = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId: community.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Debes unirte a la comunidad" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const room = await prisma.chatRoom.create({
    data: {
      communityId: community.id,
      name: parsed.data.name,
      description: parsed.data.description,
      members: { create: { userId: session.user.id } },
    },
  });

  return NextResponse.json(room);
}
