import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ChatRoom } from "@/components/chat-room";

export const dynamic = "force-dynamic";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ slug: string; roomId: string }>;
}) {
  const { slug, roomId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) notFound();

  const membership = await prisma.chatMember.findUnique({
    where: { chatRoomId_userId: { chatRoomId: roomId, userId: session.user.id } },
  });
  if (!membership) notFound();

  const rooms = await prisma.chatRoom.findMany({
    where: { communityId: community.id, members: { some: { userId: session.user.id } } },
    orderBy: { createdAt: "asc" },
  });

  const messages = await prisma.message.findMany({
    where: { chatRoomId: roomId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, username: true, avatarUrl: true } } },
    take: 200,
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
      <aside className="flex flex-col gap-1 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-neutral-900 md:h-[70vh]">
        {rooms.map((r) => (
          <Link
            key={r.id}
            href={`/communities/${slug}/chat/${r.id}`}
            className={
              r.id === roomId
                ? "rounded-lg bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                : "rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            }
          >
            # {r.name}
          </Link>
        ))}
      </aside>
      <ChatRoom
        roomId={roomId}
        currentUserId={session.user.id}
        initialMessages={JSON.parse(JSON.stringify(messages))}
      />
    </div>
  );
}
