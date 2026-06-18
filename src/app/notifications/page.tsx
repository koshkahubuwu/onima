import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Avatar } from "@/components/avatar";
import { MarkNotificationsRead } from "@/components/mark-notifications-read";

export const dynamic = "force-dynamic";

const VERB: Record<string, string> = {
  LIKE: "le dio like a tu publicación",
  COMMENT: "comentó tu publicación",
  JOIN: "se unió a tu comunidad",
  LEVEL_UP: "¡Subiste de nivel!",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { id: true, username: true, avatarUrl: true } },
      community: { select: { slug: true, name: true } },
    },
  });

  return (
    <div>
      <MarkNotificationsRead />
      <h1 className="mb-4 text-xl font-bold">Notificaciones</h1>
      <div className="flex flex-col gap-2">
        {notifications.length === 0 && (
          <p className="text-sm text-neutral-400">Nada por aquí todavía.</p>
        )}
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.community ? `/communities/${n.community.slug}` : "#"}
            className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
              n.read
                ? "border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900"
                : "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-900/20"
            }`}
          >
            {n.actor ? (
              <Avatar username={n.actor.username} avatarUrl={n.actor.avatarUrl} size="sm" />
            ) : (
              <span className="text-xl">⭐</span>
            )}
            <span>
              {n.actor && <span className="font-medium">{n.actor.username} </span>}
              {VERB[n.type] ?? n.type}
              {n.community && <span className="text-neutral-400"> · {n.community.name}</span>}
              <span className="block text-xs text-neutral-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
