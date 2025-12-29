import type { Metadata } from "next"
import { allPosts } from "content-collections"
import { PostCard } from "~/components/posts/post-card"
import { Intro, IntroTitle, IntroDescription } from "~/components/shared/intro"

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles about AI agents, coding skills, and developer productivity",
  openGraph: {
    title: "Blog | SkillUse",
    description: "Articles about AI agents, coding skills, and developer productivity",
    url: "/blog",
    type: "website",
  },
  alternates: {
    canonical: "/blog",
  },
}

export default function BlogPage() {
  // Sort posts by date descending
  const sortedPosts = allPosts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="flex flex-col gap-8">
      <Intro>
        <IntroTitle>Blog</IntroTitle>
        <IntroDescription>
          Articles about AI agents, coding skills, and developer productivity
        </IntroDescription>
      </Intro>

      <section className="border border-border">
        <div className="p-6">
          {sortedPosts.length === 0 ? (
            <p className="text-muted-foreground">No posts yet. Check back soon!</p>
          ) : (
            <div className="flex flex-col">
              {sortedPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
