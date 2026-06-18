import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional().or(z.literal("")),
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

  const posts = await prisma.post.findMany({
    where: { communityId: community.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json(posts);
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
    return NextResponse.json({ error: "Debes unirte a la comunidad para publicar" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      imageUrl: parsed.data.imageUrl || null,
      communityId: community.id,
      authorId: session.user.id,
    },
  });

  return NextResponse.json(post);
}
