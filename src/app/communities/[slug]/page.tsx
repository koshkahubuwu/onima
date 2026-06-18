import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { JoinButton } from "@/components/join-button";
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
    where: { communityId: community.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-neutral-900">
        <div>
          <h1 className="text-2xl font-bold">{community.name}</h1>
          {community.description && (
            <p className="mt-1 text-neutral-500">{community.description}</p>
          )}
          <p className="mt-2 text-sm text-neutral-400">
            {community._count.memberships} miembros
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <JoinButton slug={community.slug} joined={Boolean(membership)} />
          {membership && (
            <Link
              href={`/communities/${community.slug}/chat`}
              className="rounded-full border border-violet-600 px-4 py-2 text-center text-sm font-medium text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              Chat
            </Link>
          )}
        </div>
      </div>

      {membership && <NewPostForm slug={community.slug} />}

      <PostList posts={posts} />
    </div>
  );
}
