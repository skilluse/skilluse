import { notFound } from "next/navigation";
import { allPosts } from "content-collections";
import { MDX } from "~/components/mdx/mdx";
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
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
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
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: "#" },
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
        <MDX code={post.content} className="max-w-none!" />
      </section>

      <ShareButtons title={post.title} slug={post.slug} />
    </article>
  );
}
