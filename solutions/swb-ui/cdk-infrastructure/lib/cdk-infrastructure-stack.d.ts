import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
export declare class CdkInfrastructureStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps);
    private _createS3Bucket;
    private _deployS3Bucket;
    private _createIdentity;
    private _createDistribution;
    private _createRedirectFunction;
    private _createSecurityPolicy;
    private _getContentSecurityPolicy;
}
