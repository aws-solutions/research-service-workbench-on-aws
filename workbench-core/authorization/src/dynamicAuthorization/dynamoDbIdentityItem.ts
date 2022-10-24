import { Action } from '../action';
import { Effect } from '../permission';

export interface DynamoDBIdentityPermissionItem {
  [key: string]: unknown;
  pk: string;
  sk: string;
  action: Action;
  effect: Effect;
  subjectType: string;
  subjectId: string;
  identity: string;
  conditions: { [key: string]: unknown };
  fields: string[];
}
