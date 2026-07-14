import { SITE } from "@config";
import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const generateMarkdownId = ({ entry }: { entry: string }) =>
  entry.replace(/\.md$/, "");

const blog = defineCollection({
  type: "content_layer",
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
    generateId: generateMarkdownId,
  }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      editPost: z
        .object({
          disabled: z.boolean().optional(),
          url: z.string().optional(),
          text: z.string().optional(),
          appendFilePath: z.boolean().optional(),
        })
        .optional(),
    }),
});

const members = defineCollection({
  type: "content_layer",
  loader: glob({
    pattern: ["**/*.md", "!member.md"],
    base: "./src/content/members",
    generateId: generateMarkdownId,
  }),
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    url: z.string().optional(),
    core: z.boolean().optional(),
    ally: z.boolean().optional(),
    volunteer: z.boolean().optional(),
    socials: z.array(
      z.object({
        name: z.string(),
        href: z.string(),
      })
    ).optional(),
    badges: z.array(z.string()).optional(),
    rank: z.number().optional(),
  }),
});

const speakers = defineCollection({
  type: "content_layer",
  loader: glob({
    pattern: ["**/*.md", "!speaker-tags.md"],
    base: "./src/content/speakers",
    generateId: generateMarkdownId,
  }),
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    core: z.boolean().optional(),
    linkedInURL: z.string().optional(),
    githubURL: z.string(),
    tags: z.array(z.string()).optional(),
    speakerfolio: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    ).optional(),
  }),
});

export const collections = { blog, members, speakers };
