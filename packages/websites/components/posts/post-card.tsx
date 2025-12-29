import Image from "next/image";
import Link from "next/link";
import type { Post } from "content-collections";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group flex flex-col overflow-hidden border border-border transition-colors hover:border-foreground/20">
      {post.image && (
        <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            width={640}
            height={360}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/blog/${post.slug}`} className="block">
          <h2 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
          {post.description}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}
