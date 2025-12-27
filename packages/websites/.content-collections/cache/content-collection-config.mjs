// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { z } from "zod";
var mdxOptions = {
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings]
};
var posts = defineCollection({
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
      twitterHandle: z.string().optional()
    })
  }),
  transform: async (data, context) => {
    const content = await compileMDX(context, data, mdxOptions);
    return { ...data, content };
  }
});
var docs = defineCollection({
  name: "docs",
  directory: "content/docs",
  include: "**/*.{md,mdx}",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional().default(999)
  }),
  transform: async (data, context) => {
    const content = await compileMDX(context, data, mdxOptions);
    return { ...data, content };
  }
});
var content_collections_default = defineConfig({
  collections: [posts, docs]
});
export {
  content_collections_default as default
};
