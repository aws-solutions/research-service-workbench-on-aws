import { ConsumedCapacity, ItemCollectionMetrics } from '@aws-sdk/client-dynamodb';

export interface UpdateUnmarshalledOutput {
  Attributes?: Record<string, string>;
  ConsumedCapacity?: ConsumedCapacity;
  ItemCollectionMetrics?: ItemCollectionMetrics;
}
