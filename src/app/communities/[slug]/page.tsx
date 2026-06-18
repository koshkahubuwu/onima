import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CommunityHeader } from "@/components/community-header";
import { PostList } from "@/components/post-list";
import { NewPostForm } from "@/components/new-post-form";

export const dynamic = "force-dynamic";

export default async function CommunityPage({
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
    where: { communityId: community.id, type: { in: ["BLOG", "POLL", "QUIZ"] } },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
      pollOptions: { orderBy: { order: "asc" }, include: { _count: { select: { votes: true } } } },
      pollVotes: session?.user?.id ? { where: { userId: session.user.id } } : false,
      quizQuestions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" }, select: { id: true, text: true, order: true } } },
      },
      quizAttempts: session?.user?.id
        ? { where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 1 }
        : false,
    },
  });

  return (
    <div>
      <CommunityHeader community={community} joined={Boolean(membership)} />

      {membership && <NewPostForm slug={community.slug} />}

      <PostList posts={JSON.parse(JSON.stringify(posts))} />
    </div>
  );
}
