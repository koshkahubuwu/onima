import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ChatIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) notFound();

  const room = await prisma.chatRoom.findFirst({
    where: { communityId: community.id, members: { some: { userId: session.user.id } } },
    orderBy: { createdAt: "asc" },
  });

  if (!room) {
    return <p className="text-neutral-500">Únete a la comunidad para acceder al chat.</p>;
  }

  redirect(`/communities/${slug}/chat/${room.id}`);
}
