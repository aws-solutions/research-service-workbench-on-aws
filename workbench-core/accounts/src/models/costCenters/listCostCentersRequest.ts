import { QueryParamFilterParser } from '@aws/workbench-core-base';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListCostCentersRequestParser = z.object({
  pageSize: z.number().optional(),
  paginationToken: z.string().optional(),
  filter: z
    .object({
      name: QueryParamFilterParser.required()
    })
    .optional(),
  sort: z
    .object({
      name: z.enum(['asc', 'desc'])
    })
    .optional()
});

export type ListCostCentersRequest = z.infer<typeof ListCostCentersRequestParser>;
