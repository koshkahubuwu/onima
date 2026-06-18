import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    orderBy: { exp: "desc" },
    take: 50,
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });

  return NextResponse.json(memberships);
}
