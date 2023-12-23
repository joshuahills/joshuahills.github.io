import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		thumbnailImage: image(),
		thumbnailImageAlt: z.string(),
		author: z.string(),
	}),
});

export const collections = { blog };
