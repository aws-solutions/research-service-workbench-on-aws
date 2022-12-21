export interface EnvironmentTypeConfig {
  id: string;
  type: string;
  description: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost?: string;
  params: { key: string; value: string }[];
}
