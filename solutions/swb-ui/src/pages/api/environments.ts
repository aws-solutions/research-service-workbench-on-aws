import type { NextApiRequest, NextApiResponse } from 'next';

export interface Data {
  environment: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>): void {
  res.status(200).json({ environment: 'sagemaker' });
}
