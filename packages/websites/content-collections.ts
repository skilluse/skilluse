import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { z } from "zod";

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
            theme: "github-dark",
            keepBackground: true,
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

export default defineConfig({
  collections: [posts],
});
