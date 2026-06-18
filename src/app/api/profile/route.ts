import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const patchSchema = z.object({
  bio: z.string().max(300).optional(),
  title: z.string().max(40).optional(),
  avatarUrl: z.string().url().max(500).optional(),
  bannerUrl: z.string().url().max(500).optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    bio: user.bio,
    title: user.title,
    avatarUrl: user.avatarUrl,
    bannerUrl: user.bannerUrl,
  });
}
