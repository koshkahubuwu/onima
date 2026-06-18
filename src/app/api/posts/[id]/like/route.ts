import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { awardExp, EXP_REWARDS } from "@/lib/exp";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: postId } = await params;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
  }

  await prisma.like.create({ data: { postId, userId: session.user.id } });
  await awardExp(session.user.id, post.communityId, EXP_REWARDS.LIKE);

  if (post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: session.user.id,
        type: "LIKE",
        postId,
        communityId: post.communityId,
      },
    });
  }

  return NextResponse.json({ liked: true });
}
