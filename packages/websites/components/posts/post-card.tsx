import Link from "next/link";
import type { Post } from "content-collections";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group border-b border-border py-6 first:pt-0 last:border-b-0">
      <Link href={`/blog/${post.slug}`} className="block">
        <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {post.description}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </Link>
    </article>
  );
}
