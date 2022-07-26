/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

export interface Data {
  name: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>): void {
  res.status(200).json({ name: 'John Doe' });
}
