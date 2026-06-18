import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CommunityHeader } from "@/components/community-header";
import { MemberList } from "@/components/member-list";

export const dynamic = "force-dynamic";

const ROLE_ORDER = { OWNER: 0, LEADER: 1, CURATOR: 2, MEMBER: 3 };

export default async function MembersPage({
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

  const members = await prisma.membership.findMany({
    where: { communityId: community.id },
    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
  });
  members.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.exp - a.exp);

  const canManage = membership?.role === "OWNER" || membership?.role === "LEADER";

  return (
    <div>
      <CommunityHeader community={community} joined={Boolean(membership)} />
      <MemberList slug={slug} members={JSON.parse(JSON.stringify(members))} canManage={canManage} />
    </div>
  );
}
