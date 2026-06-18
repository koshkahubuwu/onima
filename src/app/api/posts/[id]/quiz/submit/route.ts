import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { awardExp, EXP_REWARDS } from "@/lib/exp";

const schema = z.object({
  answers: z.array(z.object({ questionId: z.string(), optionId: z.string() })),
});

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

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { quizQuestions: { include: { options: true } } },
  });
  if (!post || post.type !== "QUIZ") {
    return NextResponse.json({ error: "Quiz no encontrado" }, { status: 404 });
  }

  const total = post.quizQuestions.length;
  let score = 0;
  for (const q of post.quizQuestions) {
    const answer = parsed.data.answers.find((a) => a.questionId === q.id);
    const correctOption = q.options.find((o) => o.isCorrect);
    if (answer && correctOption && answer.optionId === correctOption.id) {
      score += 1;
    }
  }

  await prisma.quizAttempt.create({
    data: { postId, userId: session.user.id, score, total },
  });
  await awardExp(session.user.id, post.communityId, EXP_REWARDS.QUIZ_COMPLETE);

  const correctOptionsByQuestion = Object.fromEntries(
    post.quizQuestions.map((q) => [q.id, q.options.find((o) => o.isCorrect)?.id])
  );

  return NextResponse.json({ score, total, correctOptionsByQuestion });
}
