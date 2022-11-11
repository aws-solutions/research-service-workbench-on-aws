import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const metadataParser = z.object({
  id: z.string(),
  pk: z.string(),
  sk: z.string(),
  resourceType: z.string()
});
