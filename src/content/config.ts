import { defineCollection, z } from 'astro:content';

export const Tag = z.enum(['EF Core']);

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
		tags: z.array(Tag),
	}),
});

export const collections = { blog };
