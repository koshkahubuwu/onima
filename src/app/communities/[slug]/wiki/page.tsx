import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CommunityHeader } from "@/components/community-header";
import { PostList } from "@/components/post-list";

export const dynamic = "force-dynamic";

export default async function WikiPage({
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

  const posts = await prisma.post.findMany({
    where: { communityId: community.id, type: "WIKI" },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
    },
  });

  return (
    <div>
      <CommunityHeader community={community} joined={Boolean(membership)} />
      <PostList posts={JSON.parse(JSON.stringify(posts))} />
    </div>
  );
}
