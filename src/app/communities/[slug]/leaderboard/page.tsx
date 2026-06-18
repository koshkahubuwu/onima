import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CommunityHeader } from "@/components/community-header";
import { Avatar } from "@/components/avatar";
import { LevelBadge } from "@/components/level-badge";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const community = await prisma.community.findUnique({
    where: { slug },
    include: { _count: { select: { memberships: true } } },
  });
  if (!community) notFound();

  const membership = session?.user?.id
    ? await prisma.membership.findUnique({
        where: { userId_communityId: { userId: session.user.id, communityId: community.id } },
      })
    : null;

  const ranking = await prisma.membership.findMany({
    where: { communityId: community.id },
    orderBy: { exp: "desc" },
    take: 50,
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });

  return (
    <div>
      <CommunityHeader community={community} joined={Boolean(membership)} />

      <div className="flex flex-col gap-2">
        {ranking.length === 0 && (
          <p className="text-sm text-neutral-400">Todavía no hay miembros con EXP.</p>
        )}
        {ranking.map((m, i) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-neutral-900"
          >
            <span className="w-6 text-center text-sm font-semibold text-neutral-400">
              {MEDALS[i] ?? i + 1}
            </span>
            <Avatar username={m.user.username} avatarUrl={m.user.avatarUrl} size="sm" />
            <span className="flex-1 font-medium">{m.user.username}</span>
            <LevelBadge exp={m.exp} />
            <span className="w-16 text-right text-sm text-neutral-400">{m.exp} EXP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
