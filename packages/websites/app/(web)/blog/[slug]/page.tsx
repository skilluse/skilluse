import Image from "next/image";
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
    <article className="flex flex-col gap-8 md:gap-10 lg:gap-12 max-w-3xl mx-auto">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: "#" },
        ]}
      />

      <header className="flex flex-col gap-6">
        {post.image && (
          <div className="aspect-[2/1] overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              width={1280}
              height={640}
              priority
              className="size-full object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{post.title}</h1>
          <p className="mt-3 text-muted-foreground">{post.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>By {post.author.name}</span>
            <span className="hidden sm:inline">·</span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
            <span className="hidden sm:inline">·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </header>

      <section>
        <MDX code={post.content} />
      </section>

      <ShareButtons title={post.title} slug={post.slug} />
    </article>
  );
}
