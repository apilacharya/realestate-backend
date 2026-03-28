import { z } from 'zod';

const numberOrUndefined = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : Number(val)),
  z.number().min(0).optional()
);

export const listingsQuerySchema = z.object({
  suburb: z.string().optional(),
  price_min: numberOrUndefined,
  price_max: numberOrUndefined,
  beds: numberOrUndefined,
  baths: numberOrUndefined,
  property_type: z.enum(['house', 'apartment', 'townhouse', 'land']).optional(),
  keyword: z.string().max(100).optional(),
  status: z.enum(['available', 'under_offer', 'sold']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort_by: z.enum(['price_asc', 'price_desc', 'newest']).default('newest'),
});

export type ListingsQuery = z.infer<typeof listingsQuerySchema>;
