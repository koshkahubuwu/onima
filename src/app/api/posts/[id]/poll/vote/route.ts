import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { awardExp, EXP_REWARDS } from "@/lib/exp";

const schema = z.object({ optionId: z.string().min(1) });

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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.type !== "POLL") {
    return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
  }

  const option = await prisma.pollOption.findUnique({ where: { id: parsed.data.optionId } });
  if (!option || option.postId !== postId) {
    return NextResponse.json({ error: "Opción inválida" }, { status: 400 });
  }

  const existing = await prisma.pollVote.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.pollVote.update({
      where: { id: existing.id },
      data: { optionId: option.id },
    });
  } else {
    await prisma.pollVote.create({
      data: { postId, optionId: option.id, userId: session.user.id },
    });
    await awardExp(session.user.id, post.communityId, EXP_REWARDS.POLL_VOTE);
  }

  const options = await prisma.pollOption.findMany({
    where: { postId },
    orderBy: { order: "asc" },
    include: { _count: { select: { votes: true } } },
  });

  return NextResponse.json({ options, votedOptionId: option.id });
}
