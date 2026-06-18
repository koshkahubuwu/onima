import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      actor: { select: { id: true, username: true, avatarUrl: true } },
      community: { select: { slug: true, name: true } },
    },
  });

  return NextResponse.json(notifications);
}

const patchSchema = z.object({ id: z.string().optional() });

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  const id = parsed.success ? parsed.data.id : undefined;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, ...(id ? { id } : {}) },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
