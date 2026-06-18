import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { awardExp, EXP_REWARDS } from "@/lib/exp";

const baseSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const pollSchema = baseSchema.extend({
  type: z.literal("POLL"),
  options: z.array(z.string().min(1).max(80)).min(2).max(8),
});

const quizSchema = baseSchema.extend({
  type: z.literal("QUIZ"),
  questions: z
    .array(
      z.object({
        text: z.string().min(1).max(200),
        options: z
          .array(z.object({ text: z.string().min(1).max(120), isCorrect: z.boolean() }))
          .min(2)
          .max(6),
      })
    )
    .min(1)
    .max(20),
});

const blogOrWikiSchema = baseSchema.extend({
  type: z.union([z.literal("BLOG"), z.literal("WIKI")]).optional(),
});

const createSchema = z.union([pollSchema, quizSchema, blogOrWikiSchema]);

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
      pollOptions: { include: { _count: { select: { votes: true } } } },
      quizQuestions: { include: { options: { select: { id: true, text: true, order: true } } } },
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

  const data = parsed.data;

  const post = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl || null,
      communityId: community.id,
      authorId: session.user.id,
      type: "type" in data ? data.type : "BLOG",
      ...("options" in data
        ? {
            pollOptions: {
              create: data.options.map((text, order) => ({ text, order })),
            },
          }
        : {}),
      ...("questions" in data
        ? {
            quizQuestions: {
              create: data.questions.map((q, order) => ({
                text: q.text,
                order,
                options: {
                  create: q.options.map((o, oOrder) => ({
                    text: o.text,
                    isCorrect: o.isCorrect,
                    order: oOrder,
                  })),
                },
              })),
            },
          }
        : {}),
    },
    include: { pollOptions: true, quizQuestions: { include: { options: true } } },
  });

  await awardExp(session.user.id, community.id, EXP_REWARDS.POST);

  return NextResponse.json(post);
}
