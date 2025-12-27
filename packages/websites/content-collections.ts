import { defineCollection, defineConfig } from "@content-collections/core"
import { type Options, compileMDX } from "@content-collections/mdx"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import { z } from "zod"

const mdxOptions: Options = {
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
}

// Blog posts
const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "**/*.{md,mdx}",
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
  transform: async (data, context) => {
    const content = await compileMDX(context, data, mdxOptions)
    return { ...data, content }
  },
})

// Documentation
const docs = defineCollection({
  name: "docs",
  directory: "content/docs",
  include: "**/*.{md,mdx}",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional().default(999),
  }),
  transform: async (data, context) => {
    const content = await compileMDX(context, data, mdxOptions)
    return { ...data, content }
  },
})

export default defineConfig({
  collections: [posts, docs],
})
