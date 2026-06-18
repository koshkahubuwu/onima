import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { awardExp, EXP_REWARDS } from "@/lib/exp";

const createSchema = z.object({
  content: z.string().min(1).max(1000),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, username: true, avatarUrl: true } } },
  });
  return NextResponse.json(comments);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: postId } = await params;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { postId, authorId: session.user.id, content: parsed.data.content },
    include: { author: { select: { id: true, username: true, avatarUrl: true } } },
  });

  await awardExp(session.user.id, post.communityId, EXP_REWARDS.COMMENT);

  if (post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: session.user.id,
        type: "COMMENT",
        postId,
        communityId: post.communityId,
      },
    });
  }

  return NextResponse.json(comment);
}
