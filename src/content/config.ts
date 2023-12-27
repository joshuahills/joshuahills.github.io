import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		thumbnailImage: image().optional(),
		author: z.string(),
		status: z.enum(['draft', 'published']),
	}),
});

export const collections = { blog };
