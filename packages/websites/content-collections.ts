import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import mdxMermaid from "mdx-mermaid";
import { z } from "zod";

// Extract h2/h3 headings from markdown content
type Heading = {
  level: number;
  text: string;
  id: string;
};

function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Generate slug from text (same as rehype-slug)
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ level, text, id });
  }

  return headings;
}

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    author: z.object({
      name: z.string(),
      image: z.string().optional(),
      twitterHandle: z.string().optional(),
    }),
  }),
  transform: async (document, context) => {
    const content = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm, mdxMermaid],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              className: ["anchor"],
            },
          },
        ],
        [
          rehypePrettyCode,
          {
            theme: "github-light",
            keepBackground: false,
          },
        ],
      ],
    });

    // Calculate reading time (roughly 200 words per minute)
    const wordCount = document.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Generate slug from file path
    const slug = document._meta.path.replace(/\.mdx$/, "");

    return {
      ...document,
      content,
      slug,
      readingTime,
    };
  },
});

const docs = defineCollection({
  name: "docs",
  directory: "content/docs",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional().default(999),
  }),
  transform: async (document, context) => {
    const content = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm, mdxMermaid],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              className: ["anchor"],
            },
          },
        ],
        [
          rehypePrettyCode,
          {
            theme: "github-light",
            keepBackground: false,
          },
        ],
      ],
    });
    const headings = extractHeadings(document.content);

    // Generate slug from file path (e.g., "commands/auth" or "index" -> "")
    let slug = document._meta.path.replace(/\.mdx$/, "");
    if (slug === "index") {
      slug = "";
    } else if (slug.endsWith("/index")) {
      slug = slug.replace(/\/index$/, "");
    }

    return {
      ...document,
      content,
      headings,
      slug,
    };
  },
});

export default defineConfig({
  collections: [posts, docs],
});

export type { Heading };
