import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      memberships: { include: { community: true } },
      posts: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { posts: true } },
    },
  });

  if (!user) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-neutral-900">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-600 dark:bg-violet-900/40">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user.username}</h1>
          {user.bio && <p className="text-neutral-500">{user.bio}</p>}
          <p className="mt-1 text-sm text-neutral-400">{user._count.posts} publicaciones</p>
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
      <div className="flex flex-col gap-2">
        {user.posts.length === 0 && (
          <p className="text-sm text-neutral-400">Sin publicaciones todavía.</p>
        )}
        {user.posts.map((p) => (
          <div key={p.id} className="rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
            <p className="font-medium">{p.title}</p>
            <p className="text-neutral-500">{p.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
