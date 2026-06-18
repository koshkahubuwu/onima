import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Avatar } from "@/components/avatar";
import { ExpBar } from "@/components/level-badge";
import { EditProfileForm } from "@/components/edit-profile-form";
import { PostList } from "@/components/post-list";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      memberships: { include: { community: true } },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
          likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
        },
      },
      _count: { select: { posts: true } },
    },
  });

  if (!user) notFound();

  const totalExp = user.memberships.reduce((sum, m) => sum + m.exp, 0);
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div
          className="h-28 w-full sm:h-36"
          style={
            user.bannerUrl
              ? { backgroundImage: `url(${user.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "linear-gradient(135deg, #7C3AED, #ec4899)" }
          }
        />
        <div className="-mt-10 flex flex-col gap-3 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-3">
            <Avatar username={user.username} avatarUrl={user.avatarUrl} size="xl" ring />
            <div className="pb-1">
              <h1 className="text-xl font-bold">{user.username}</h1>
              {user.title && <p className="text-sm text-violet-600 dark:text-violet-300">{user.title}</p>}
            </div>
          </div>
          {isOwnProfile && (
            <EditProfileForm
              initial={{
                bio: user.bio ?? "",
                title: user.title ?? "",
                avatarUrl: user.avatarUrl ?? "",
                bannerUrl: user.bannerUrl ?? "",
              }}
            />
          )}
        </div>
        <div className="px-5 pb-5">
          {user.bio && <p className="mb-3 text-neutral-600 dark:text-neutral-300">{user.bio}</p>}
          <div className="mb-2 max-w-xs">
            <ExpBar exp={totalExp} />
          </div>
          <p className="text-sm text-neutral-400">{user._count.posts} publicaciones</p>
        </div>
      </div>

      <h2 className="mb-2 font-semibold">Comunidades</h2>
      <div className="mb-6 flex flex-wrap gap-2">
        {user.memberships.length === 0 && (
          <p className="text-sm text-neutral-400">Sin comunidades todavía.</p>
        )}
        {user.memberships.map((m) => (
          <Link
            key={m.id}
            href={`/communities/${m.community.slug}`}
            className="rounded-full border border-black/10 px-3 py-1 text-sm hover:border-violet-400 hover:text-violet-600 dark:border-white/10"
          >
            {m.community.name}
          </Link>
        ))}
      </div>

      <h2 className="mb-2 font-semibold">Publicaciones recientes</h2>
      <PostList posts={JSON.parse(JSON.stringify(user.posts))} />
    </div>
  );
}
