import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListCostCentersRequestParser = z.object({
  pageSize: z.number().optional(),
  paginationToken: z.string().optional(),
  filter?: z.name: z.string().optional()

});

export type ListCostCentersRequest = z.infer<typeof ListCostCentersRequestParser>;
