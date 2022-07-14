"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkInfrastructureStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cloudfront_1 = require("aws-cdk-lib/aws-cloudfront");
const aws_cloudfront_origins_1 = require("aws-cdk-lib/aws-cloudfront-origins");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_s3_deployment_1 = require("aws-cdk-lib/aws-s3-deployment");
const path = require("path");
class CdkInfrastructureStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const bucket = this._createS3Bucket("S3BucketArtifactsArnOutput");
        this._deployS3Bucket(bucket);
        const originAccessIdentity = this._createIdentity(bucket);
        const redirectFunction = this._createRedirectFunction();
        const securityHeaders = this._createSecurityPolicy("https://i3paudvhlj.execute-api.us-east-1.amazonaws.com");
        const distribution = this._createDistribution(originAccessIdentity, bucket, redirectFunction, securityHeaders);
    }
    _createS3Bucket(s3ArtifactName) {
        const s3Bucket = new aws_s3_1.Bucket(this, 'swb-ui-bucket', {
            accessControl: aws_s3_1.BucketAccessControl.PRIVATE
        });
        new aws_cdk_lib_1.CfnOutput(this, s3ArtifactName, {
            value: s3Bucket.bucketArn
        });
        return s3Bucket;
    }
    _deployS3Bucket(bucket) {
        new aws_s3_deployment_1.BucketDeployment(this, 'swb-ui-bucket-deployment', {
            destinationBucket: bucket,
            sources: [aws_s3_deployment_1.Source.asset(path.resolve(__dirname, '../../out'))]
        });
    }
    _createIdentity(bucket) {
        const originAccessIdentity = new aws_cloudfront_1.OriginAccessIdentity(this, 'swb-ui-origin-access-identity');
        bucket.grantRead(originAccessIdentity);
        return originAccessIdentity;
    }
    _createDistribution(originAccessIdentity, bucket, redirectFunction, securityPolicy) {
        const distribution = new aws_cloudfront_1.Distribution(this, 'swb-ui-distribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new aws_cloudfront_origins_1.S3Origin(bucket, { originAccessIdentity }),
                responseHeadersPolicy: securityPolicy,
                functionAssociations: [{
                        function: redirectFunction,
                        eventType: aws_cloudfront_1.FunctionEventType.VIEWER_REQUEST
                    }],
            },
            additionalBehaviors: {}
        });
        new aws_cdk_lib_1.CfnOutput(this, "S3DistributionArtifactsDomain", {
            value: distribution.distributionDomainName
        });
        return distribution;
    }
    _createRedirectFunction() {
        return new aws_cloudfront_1.Function(this, 'swb-ui-redirect-distribution-function', {
            code: aws_cloudfront_1.FunctionCode.fromFile({
                filePath: path.join(__dirname, '../redirectFunction.js')
            }),
            functionName: 'RedirectRoutingFunction'
        });
    }
    _createSecurityPolicy(apiBaseUrl) {
        return new aws_cloudfront_1.ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
            responseHeadersPolicyName: 'swb-ui-policy',
            comment: 'Security policy',
            securityHeadersBehavior: {
                contentSecurityPolicy: { contentSecurityPolicy: this._getContentSecurityPolicy(apiBaseUrl), override: false },
                contentTypeOptions: { override: true },
                frameOptions: { frameOption: aws_cloudfront_1.HeadersFrameOption.SAMEORIGIN, override: false },
                referrerPolicy: { referrerPolicy: aws_cloudfront_1.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: false },
                strictTransportSecurity: { accessControlMaxAge: aws_cdk_lib_1.Duration.seconds(31536000), includeSubdomains: false, override: false },
                xssProtection: { protection: true, modeBlock: true, override: false },
            },
        });
    }
    _getContentSecurityPolicy(apiBaseUrl) {
        return `default-src 'self'; connect-src ${apiBaseUrl}; font-src 'self' data: ; style-src 'self' 'unsafe-inline';`;
    }
}
exports.CdkInfrastructureStack = CdkInfrastructureStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWluZnJhc3RydWN0dXJlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLWluZnJhc3RydWN0dXJlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFxRTtBQUNyRSwrREFBNkw7QUFDN0wsK0VBQThEO0FBQzlELCtDQUFpRTtBQUNqRSxxRUFBeUU7QUFFekUsNkJBQTZCO0FBRTdCLE1BQWEsc0JBQXVCLFNBQVEsbUJBQUs7SUFDL0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFrQjtRQUMxRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUN4RCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsd0RBQXdELENBQUMsQ0FBQztRQUM3RyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLEVBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ2hILENBQUM7SUFDTyxlQUFlLENBQUMsY0FBc0I7UUFDNUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNqRCxhQUFhLEVBQUUsNEJBQW1CLENBQUMsT0FBTztTQUMzQyxDQUFDLENBQUM7UUFFSCxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNsQyxLQUFLLEVBQUUsUUFBUSxDQUFDLFNBQVM7U0FDMUIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUNPLGVBQWUsQ0FBQyxNQUFhO1FBQ25DLElBQUksb0NBQWdCLENBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFO1lBQ3JELGlCQUFpQixFQUFFLE1BQU07WUFDekIsT0FBTyxFQUFFLENBQUMsMEJBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztTQUM5RCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sZUFBZSxDQUFDLE1BQWM7UUFDcEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLHFDQUFvQixDQUFDLElBQUksRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1FBQzdGLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUN2QyxPQUFPLG9CQUFvQixDQUFDO0lBQzlCLENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxvQkFBeUMsRUFBRSxNQUFhLEVBQUUsZ0JBQTBCLEVBQUUsY0FBb0M7UUFDcEosTUFBTSxZQUFZLEdBQUcsSUFBSSw2QkFBWSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNqRSxpQkFBaUIsRUFBRSxZQUFZO1lBRS9CLGVBQWUsRUFBRTtnQkFDZixNQUFNLEVBQUUsSUFBSSxpQ0FBUSxDQUFDLE1BQU0sRUFBRSxFQUFDLG9CQUFvQixFQUFDLENBQUM7Z0JBQ3BELHFCQUFxQixFQUFFLGNBQWM7Z0JBQ3JDLG9CQUFvQixFQUFDLENBQUM7d0JBQ2xCLFFBQVEsRUFBRSxnQkFBZ0I7d0JBQzFCLFNBQVMsRUFBRSxrQ0FBaUIsQ0FBQyxjQUFjO3FCQUM5QyxDQUFDO2FBQ0g7WUFDRCxtQkFBbUIsRUFBQyxFQUVuQjtTQUVGLENBQUMsQ0FBQztRQUNILElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsK0JBQStCLEVBQUU7WUFDbkQsS0FBSyxFQUFFLFlBQVksQ0FBQyxzQkFBc0I7U0FDM0MsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQztJQUVPLHVCQUF1QjtRQUM3QixPQUFPLElBQUkseUJBQVEsQ0FBQyxJQUFJLEVBQUUsdUNBQXVDLEVBQUU7WUFDakUsSUFBSSxFQUFFLDZCQUFZLENBQUMsUUFBUSxDQUFDO2dCQUMxQixRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsd0JBQXdCLENBQUM7YUFDekQsQ0FBQztZQUNGLFlBQVksRUFBRSx5QkFBeUI7U0FDeEMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVPLHFCQUFxQixDQUFDLFVBQWlCO1FBQzdDLE9BQU8sSUFBSSxzQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDOUQseUJBQXlCLEVBQUUsZUFBZTtZQUMxQyxPQUFPLEVBQUUsaUJBQWlCO1lBQzFCLHVCQUF1QixFQUFFO2dCQUN2QixxQkFBcUIsRUFBRSxFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO2dCQUM3RyxrQkFBa0IsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7Z0JBQ3RDLFlBQVksRUFBRSxFQUFFLFdBQVcsRUFBRSxtQ0FBa0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRTtnQkFDN0UsY0FBYyxFQUFFLEVBQUUsY0FBYyxFQUFFLHNDQUFxQixDQUFDLCtCQUErQixFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7Z0JBQzFHLHVCQUF1QixFQUFFLEVBQUUsbUJBQW1CLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7Z0JBQ3ZILGFBQWEsRUFBRSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO2FBQ3RFO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNPLHlCQUF5QixDQUFDLFVBQWlCO1FBQ2pELE9BQU8sbUNBQW1DLFVBQVUsNkRBQTZELENBQUM7SUFDcEgsQ0FBQztDQUNGO0FBbkZELHdEQW1GQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENmbk91dHB1dCwgRHVyYXRpb24sIFN0YWNrLCBTdGFja1Byb3BzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgRGlzdHJpYnV0aW9uLCBGdW5jdGlvbiwgRnVuY3Rpb25Db2RlLCBGdW5jdGlvbkV2ZW50VHlwZSwgSGVhZGVyc0ZyYW1lT3B0aW9uLCBIZWFkZXJzUmVmZXJyZXJQb2xpY3ksIE9yaWdpbkFjY2Vzc0lkZW50aXR5LCBSZXNwb25zZUhlYWRlcnNQb2xpY3kgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgeyBTM09yaWdpbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnMnO1xuaW1wb3J0IHsgQnVja2V0LCBCdWNrZXRBY2Nlc3NDb250cm9sIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IEJ1Y2tldERlcGxveW1lbnQsIFNvdXJjZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMy1kZXBsb3ltZW50JztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgY2xhc3MgQ2RrSW5mcmFzdHJ1Y3R1cmVTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBidWNrZXQgPSB0aGlzLl9jcmVhdGVTM0J1Y2tldChcIlMzQnVja2V0QXJ0aWZhY3RzQXJuT3V0cHV0XCIpO1xuICAgIHRoaXMuX2RlcGxveVMzQnVja2V0KGJ1Y2tldCk7XG4gICAgY29uc3Qgb3JpZ2luQWNjZXNzSWRlbnRpdHkgPSB0aGlzLl9jcmVhdGVJZGVudGl0eShidWNrZXQpO1xuICAgIGNvbnN0IHJlZGlyZWN0RnVuY3Rpb24gPSB0aGlzLl9jcmVhdGVSZWRpcmVjdEZ1bmN0aW9uKCk7XG4gICAgY29uc3Qgc2VjdXJpdHlIZWFkZXJzID0gdGhpcy5fY3JlYXRlU2VjdXJpdHlQb2xpY3koXCJodHRwczovL2kzcGF1ZHZobGouZXhlY3V0ZS1hcGkudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cIik7XG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gdGhpcy5fY3JlYXRlRGlzdHJpYnV0aW9uKG9yaWdpbkFjY2Vzc0lkZW50aXR5LGJ1Y2tldCwgcmVkaXJlY3RGdW5jdGlvbiwgc2VjdXJpdHlIZWFkZXJzKTtcbiAgfVxuICBwcml2YXRlIF9jcmVhdGVTM0J1Y2tldChzM0FydGlmYWN0TmFtZTogc3RyaW5nKTogQnVja2V0IHtcbiAgICBjb25zdCBzM0J1Y2tldCA9IG5ldyBCdWNrZXQodGhpcywgJ3N3Yi11aS1idWNrZXQnLCB7XG4gICAgICBhY2Nlc3NDb250cm9sOiBCdWNrZXRBY2Nlc3NDb250cm9sLlBSSVZBVEVcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgczNBcnRpZmFjdE5hbWUsIHtcbiAgICAgIHZhbHVlOiBzM0J1Y2tldC5idWNrZXRBcm5cbiAgICB9KTtcbiAgICByZXR1cm4gczNCdWNrZXQ7XG4gIH1cbiAgcHJpdmF0ZSBfZGVwbG95UzNCdWNrZXQoYnVja2V0OkJ1Y2tldCk6IHZvaWQge1xuICAgIG5ldyBCdWNrZXREZXBsb3ltZW50KHRoaXMsICdzd2ItdWktYnVja2V0LWRlcGxveW1lbnQnLCB7XG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogYnVja2V0LFxuICAgICAgc291cmNlczogW1NvdXJjZS5hc3NldChwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vb3V0JykpXVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlSWRlbnRpdHkoYnVja2V0OiBCdWNrZXQpOiBPcmlnaW5BY2Nlc3NJZGVudGl0eSB7XG4gICAgY29uc3Qgb3JpZ2luQWNjZXNzSWRlbnRpdHkgPSBuZXcgT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgJ3N3Yi11aS1vcmlnaW4tYWNjZXNzLWlkZW50aXR5Jyk7XG4gICAgYnVja2V0LmdyYW50UmVhZChvcmlnaW5BY2Nlc3NJZGVudGl0eSk7XG4gICAgcmV0dXJuIG9yaWdpbkFjY2Vzc0lkZW50aXR5O1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRGlzdHJpYnV0aW9uKG9yaWdpbkFjY2Vzc0lkZW50aXR5Ok9yaWdpbkFjY2Vzc0lkZW50aXR5LCBidWNrZXQ6QnVja2V0LCByZWRpcmVjdEZ1bmN0aW9uOiBGdW5jdGlvbiwgc2VjdXJpdHlQb2xpY3k6UmVzcG9uc2VIZWFkZXJzUG9saWN5KTogRGlzdHJpYnV0aW9uIHtcbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSBuZXcgRGlzdHJpYnV0aW9uKHRoaXMsICdzd2ItdWktZGlzdHJpYnV0aW9uJywge1xuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcbiAgICAgIFxuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IFMzT3JpZ2luKGJ1Y2tldCwge29yaWdpbkFjY2Vzc0lkZW50aXR5fSksXG4gICAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeTogc2VjdXJpdHlQb2xpY3ksXG4gICAgICAgIGZ1bmN0aW9uQXNzb2NpYXRpb25zOlt7XG4gICAgICAgICAgICBmdW5jdGlvbjogcmVkaXJlY3RGdW5jdGlvbixcbiAgICAgICAgICAgIGV2ZW50VHlwZTogRnVuY3Rpb25FdmVudFR5cGUuVklFV0VSX1JFUVVFU1RcbiAgICAgICAgfV0sXG4gICAgICB9LFxuICAgICAgYWRkaXRpb25hbEJlaGF2aW9yczp7XG5cbiAgICAgIH1cblxuICAgIH0pO1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgXCJTM0Rpc3RyaWJ1dGlvbkFydGlmYWN0c0RvbWFpblwiLCB7XG4gICAgICB2YWx1ZTogZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWVcbiAgICB9KTtcbiAgICByZXR1cm4gZGlzdHJpYnV0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlUmVkaXJlY3RGdW5jdGlvbigpOkZ1bmN0aW9ue1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb24odGhpcywgJ3N3Yi11aS1yZWRpcmVjdC1kaXN0cmlidXRpb24tZnVuY3Rpb24nLCB7XG4gICAgICBjb2RlOiBGdW5jdGlvbkNvZGUuZnJvbUZpbGUoe1xuICAgICAgICBmaWxlUGF0aDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3JlZGlyZWN0RnVuY3Rpb24uanMnKVxuICAgICAgfSksXG4gICAgICBmdW5jdGlvbk5hbWU6ICdSZWRpcmVjdFJvdXRpbmdGdW5jdGlvbidcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlU2VjdXJpdHlQb2xpY3koYXBpQmFzZVVybDpzdHJpbmcpOlJlc3BvbnNlSGVhZGVyc1BvbGljeXtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlSGVhZGVyc1BvbGljeSh0aGlzLCAnUmVzcG9uc2VIZWFkZXJzUG9saWN5Jywge1xuICAgICAgcmVzcG9uc2VIZWFkZXJzUG9saWN5TmFtZTogJ3N3Yi11aS1wb2xpY3knLFxuICAgICAgY29tbWVudDogJ1NlY3VyaXR5IHBvbGljeScsXG4gICAgICBzZWN1cml0eUhlYWRlcnNCZWhhdmlvcjoge1xuICAgICAgICBjb250ZW50U2VjdXJpdHlQb2xpY3k6IHsgY29udGVudFNlY3VyaXR5UG9saWN5OiB0aGlzLl9nZXRDb250ZW50U2VjdXJpdHlQb2xpY3koYXBpQmFzZVVybCksIG92ZXJyaWRlOiBmYWxzZSB9LFxuICAgICAgICBjb250ZW50VHlwZU9wdGlvbnM6IHsgb3ZlcnJpZGU6IHRydWUgfSxcbiAgICAgICAgZnJhbWVPcHRpb25zOiB7IGZyYW1lT3B0aW9uOiBIZWFkZXJzRnJhbWVPcHRpb24uU0FNRU9SSUdJTiwgb3ZlcnJpZGU6IGZhbHNlIH0sXG4gICAgICAgIHJlZmVycmVyUG9saWN5OiB7IHJlZmVycmVyUG9saWN5OiBIZWFkZXJzUmVmZXJyZXJQb2xpY3kuU1RSSUNUX09SSUdJTl9XSEVOX0NST1NTX09SSUdJTiwgb3ZlcnJpZGU6IGZhbHNlIH0sXG4gICAgICAgIHN0cmljdFRyYW5zcG9ydFNlY3VyaXR5OiB7IGFjY2Vzc0NvbnRyb2xNYXhBZ2U6IER1cmF0aW9uLnNlY29uZHMoMzE1MzYwMDApLCBpbmNsdWRlU3ViZG9tYWluczogZmFsc2UsIG92ZXJyaWRlOiBmYWxzZSB9LFxuICAgICAgICB4c3NQcm90ZWN0aW9uOiB7IHByb3RlY3Rpb246IHRydWUsIG1vZGVCbG9jazogdHJ1ZSwgb3ZlcnJpZGU6IGZhbHNlIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG4gIHByaXZhdGUgX2dldENvbnRlbnRTZWN1cml0eVBvbGljeShhcGlCYXNlVXJsOnN0cmluZyk6c3RyaW5ne1xuICAgIHJldHVybiBgZGVmYXVsdC1zcmMgJ3NlbGYnOyBjb25uZWN0LXNyYyAke2FwaUJhc2VVcmx9OyBmb250LXNyYyAnc2VsZicgZGF0YTogOyBzdHlsZS1zcmMgJ3NlbGYnICd1bnNhZmUtaW5saW5lJztgO1xuICB9XG59XG4iXX0=