import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";

const createSchema = z.object({
  name: z.string().min(3).max(40),
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().max(500).optional(),
  category: z.enum(COMMUNITY_CATEGORIES).optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  bannerUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const communities = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { memberships: true, posts: true } },
    },
  });
  return NextResponse.json(communities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, slug, description, category, themeColor, bannerUrl } = parsed.data;

  const existing = await prisma.community.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Ese identificador ya está en uso" }, { status: 409 });
  }

  const community = await prisma.community.create({
    data: {
      name,
      slug,
      description,
      category,
      themeColor,
      bannerUrl: bannerUrl || null,
      ownerId: session.user.id,
      memberships: {
        create: { userId: session.user.id, role: "OWNER" },
      },
      chatRooms: {
        create: {
          name: "General",
          members: { create: { userId: session.user.id } },
        },
      },
    },
  });

  return NextResponse.json(community);
}
