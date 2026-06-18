import { PostCard, type PostWithRelations } from "@/components/post-card";

export function PostList({ posts }: { posts: PostWithRelations[] }) {
  if (posts.length === 0) {
    return <p className="text-neutral-500">Todavía no hay publicaciones aquí.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
