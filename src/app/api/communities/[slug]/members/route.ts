import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const ROLE_ORDER = { OWNER: 0, LEADER: 1, CURATOR: 2, MEMBER: 3 };

const patchSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["LEADER", "CURATOR", "MEMBER"]),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) {
    return NextResponse.json({ error: "Comunidad no encontrada" }, { status: 404 });
  }

  const memberships = await prisma.membership.findMany({
    where: { communityId: community.id },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });

  memberships.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.exp - a.exp);

  return NextResponse.json(memberships);
}

export async function PATCH(
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

  const requester = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId: community.id } },
  });
  if (!requester || (requester.role !== "OWNER" && requester.role !== "LEADER")) {
    return NextResponse.json({ error: "No tienes permiso para gestionar roles" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const target = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: parsed.data.userId, communityId: community.id } },
  });
  if (!target || target.role === "OWNER") {
    return NextResponse.json({ error: "Miembro inválido" }, { status: 400 });
  }

  const updated = await prisma.membership.update({
    where: { id: target.id },
    data: { role: parsed.data.role },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });

  return NextResponse.json(updated);
}
