"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface PostWithRelations {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date | string;
  author: { id: string; username: string; avatarUrl: string | null };
  _count: { likes: number; comments: number };
  likes?: { id: string }[];
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; avatarUrl: string | null };
}

export function PostCard({ post }: { post: PostWithRelations }) {
  const router = useRouter();
  const [liked, setLiked] = useState(Boolean(post.likes && post.likes.length > 0));
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  async function toggleLike() {
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount((c) => (data.liked ? c + 1 : c - 1));
    }
  }

  async function loadComments() {
    setShowComments((v) => !v);
    if (comments) return;
    setLoadingComments(true);
    const res = await fetch(`/api/posts/${post.id}/comments`);
    if (res.ok) setComments(await res.json());
    setLoadingComments(false);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText.trim() }),
    });
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...(prev ?? []), newComment]);
      setCommentText("");
    }
  }

  return (
    <article className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
      <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
        <span className="font-medium text-neutral-700 dark:text-neutral-300">
          {post.author.username}
        </span>
        <span>·</span>
        <time>{new Date(post.createdAt).toLocaleString()}</time>
      </div>
      <h3 className="text-lg font-semibold">{post.title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
        {post.content}
      </p>
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="mt-3 max-h-96 w-full rounded-lg object-cover" />
      )}

      <div className="mt-3 flex items-center gap-4 text-sm text-neutral-500">
        <button
          onClick={toggleLike}
          className={liked ? "font-medium text-rose-600" : "hover:text-rose-600"}
        >
          {liked ? "♥" : "♡"} {likeCount}
        </button>
        <button onClick={loadComments} className="hover:text-violet-600">
          💬 {post._count.comments}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 border-t border-black/10 pt-3 dark:border-white/10">
          {loadingComments && <p className="text-sm text-neutral-400">Cargando...</p>}
          <div className="flex flex-col gap-2">
            {comments?.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-medium">{c.author.username}</span>{" "}
                <span className="text-neutral-600 dark:text-neutral-400">{c.content}</span>
              </div>
            ))}
            {comments?.length === 0 && (
              <p className="text-sm text-neutral-400">Sé el primero en comentar.</p>
            )}
          </div>
          <form onSubmit={submitComment} className="mt-2 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              maxLength={1000}
              className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm dark:bg-neutral-950 dark:border-white/10"
            />
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
