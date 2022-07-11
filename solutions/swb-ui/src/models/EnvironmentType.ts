export interface EnvTypeItem {
  id: string;
  name: string;
  description: string;
  status: EnvironmentTypeStatus;
  type: string;
}
export type EnvironmentTypeStatus = 'APPROVED' | 'NOT_APPROVED';
