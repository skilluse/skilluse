import { ImageResponse } from "next/og"
import { allPosts } from "content-collections"
import { config } from "~/config"

export const alt = "Blog post"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OGImage({ params }: Props) {
  const { slug } = await params
  const post = allPosts.find((p) => p.slug === slug)

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#ededed",
            fontSize: "48px",
            fontFamily: "monospace",
          }}
        >
          Post Not Found
        </div>
      ),
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#05CE91",
            fontSize: "28px",
            marginBottom: "40px",
          }}
        >
          <span style={{ color: "#ededed" }}>&gt;</span> {config.site.name}{" "}
          <span style={{ color: "#52525b" }}>/</span>{" "}
          <span style={{ color: "#a1a1aa" }}>blog</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "#ededed",
              fontSize: "56px",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: "24px",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              color: "#a1a1aa",
              fontSize: "28px",
              lineHeight: 1.4,
            }}
          >
            {post.description}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#52525b",
            fontSize: "22px",
          }}
        >
          <span>By {post.author.name}</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
