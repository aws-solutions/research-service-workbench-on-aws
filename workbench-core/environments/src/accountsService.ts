// import { QueryCommandOutput,
//     ScanCommandOutput,
//     GetItemCommandOutput,
//     BatchGetItemCommandOutput,
//     AttributeValue,
//     UpdateItemCommandOutput,
//     DeleteItemCommandOutput,
//     BatchWriteItemCommandOutput} from '@aws-sdk/client-dynamodb';
// import { DynamoDBScannerService,
//     DynamoDBGetterService,
//     DynamoDBQueryService,
//     DynamoDBUpdaterService,
//     DynamoDBDeleterService,
//     DynamoDBBatchWriteOrDeleteService } from '@amzn/workbench-core-base';

// import _ from 'lodash';

// export default class AccountsService {
//     // private _aws: AwsService;
//     private _ddbScanner: DynamoDBScannerService;
//     private _ddbGetter?: DynamoDBGetterService;
//     private _ddbQuery: DynamoDBQueryService;
//     private _ddbUpdater?: DynamoDBUpdaterService;
//     private _ddbDeleter?: DynamoDBDeleterService;
//     private _ddbBatchWriteOrDeleter: DynamoDBBatchWriteOrDeleteService;
//     private _awsRegion: string;
//     private _tableName: string

//     public constructor(constants: { AWS_REGION: string; TABLE_NAME: string}) {
//         const { AWS_REGION, TABLE_NAME } = constants;
//         this._awsRegion = AWS_REGION;
//         this._tableName = TABLE_NAME;
//         // this._aws = new AwsService({ AWS_REGION }, TABLE_NAME);
//         this._ddbScanner = new DynamoDBScannerService({region: AWS_REGION, table: TABLE_NAME});
//         // this._ddbGetter = new DynamoDBGetterService({region: AWS_REGION, table: TABLE_NAME});
//         this._ddbQuery = new DynamoDBQueryService({region: AWS_REGION, table: TABLE_NAME});
//         this._ddbBatchWriteOrDeleter = new DynamoDBBatchWriteOrDeleteService({region: AWS_REGION, table: TABLE_NAME});
//     }

//     public async getAccount(accountId: string): Promise<{ [key: string]: AttributeValue; }> {
//         this._ddbGetter = new DynamoDBGetterService({region: this._awsRegion, table: this._tableName, key: this._makePrimaryKeyFromOneValue(accountId)});
//         const account = await this._ddbGetter.getter.get();
//         if ('Item' in account){
//             if (account.Item){
//                 return account.Item;
//             }
//         }
//         throw new Error('AccountsService<==did not get account from table')
//     }

//     private _makePrimaryKeyFromOneValue(value: string): {[key: string]: AttributeValue} {
//         return {'pk': {S: value}, 'sk': {S: value}};
//     }
// }
