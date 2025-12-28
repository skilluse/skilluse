import { notFound } from "next/navigation";
import { allPosts } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";
import { Breadcrumbs } from "~/components/layout/breadcrumbs";
import { ShareButtons } from "~/components/posts/share-buttons";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found | SkillUse",
    };
  }

  return {
    title: `${post.title} | SkillUse Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <header className="border border-border p-6">
        <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
        <p className="mt-2 text-muted-foreground">{post.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>By {post.author.name}</span>
          </div>
          <span>·</span>
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
      </header>

      <section className="border border-border p-6">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXContent code={post.content} />
        </div>
      </section>

      <ShareButtons title={post.title} slug={post.slug} />
    </article>
  );
}
